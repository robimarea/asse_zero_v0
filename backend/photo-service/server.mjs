import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import compression from 'compression';
import crypto from 'crypto';

const {
  MYSQL_HOST = '127.0.0.1',
  MYSQL_PORT = '3306',
  MYSQL_USER = 'assezero',
  MYSQL_PASSWORD = 'appsecret',
  MYSQL_DATABASE = 'photos_svc',
  JWT_SECRET = 'dev_jwt_secret_change_in_production',
} = process.env;

const pool = mysql.createPool({
  host: MYSQL_HOST,
  port: Number(MYSQL_PORT),
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 8,
});

async function waitForMysql({ attempts = 30, delayMs = 2000 } = {}) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const c = await pool.getConnection();
      c.release();
      return;
    } catch (err) {
      console.warn(`[photo-service] MySQL non pronto (${i + 1}/${attempts}): ${err.message}`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error('Impossibile connettersi a MySQL');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function isTokenBlacklisted(token) {
  const hash = hashToken(token);
  try {
    const [rows] = await pool.query('SELECT 1 FROM auth_svc.token_blacklist WHERE token_hash = ? LIMIT 1', [hash]);
    return rows.length > 0;
  } catch (err) {
    console.error('[photo-service] Errore verifica blacklist token:', err);
    return false;
  }
}

async function checkAndLogUpload(fileSizeBytes) {
  const limitBytes = 50 * 1024 * 1024 * 1024; // 50 GB
  try {
    const [rows] = await pool.query(`
      SELECT COALESCE(SUM(file_size_bytes), 0) AS total_bytes 
      FROM auth_svc.upload_logs 
      WHERE uploaded_at >= NOW() - INTERVAL 1 DAY
    `);
    const currentBytes = Number(rows[0].total_bytes);
    if (currentBytes + fileSizeBytes > limitBytes) {
      const remainingGb = ((limitBytes - currentBytes) / (1024 * 1024 * 1024)).toFixed(2);
      throw new Error(`Quota di caricamento di 50GB nelle ultime 24 ore superata. Spazio residuo per oggi: ${Math.max(0, remainingGb)} GB.`);
    }
    await pool.query('INSERT INTO auth_svc.upload_logs (file_size_bytes) VALUES (?)', [fileSizeBytes]);
  } catch (err) {
    if (err.message && err.message.startsWith('Quota')) {
      throw err;
    }
    console.error('[photo-service] Errore tracciamento log di upload:', err);
  }
}

function bearerToken(req) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return null;
  return h.slice(7).trim();
}

/** Solo admin o editor possono modificare il catalogo foto. */
async function requirePhotoStaff(req, res, next) {
  const token = bearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Token mancante' });
    return;
  }
  try {
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      res.status(401).json({ error: 'Sessione terminata (token invalidato)' });
      return;
    }
    const payload = jwt.verify(token, JWT_SECRET);
    const role = payload.role;
    if (role !== 'admin' && role !== 'editor') {
      res.status(403).json({ error: 'Solo staff autorizzato sulle foto' });
      return;
    }
    req.staff = { id: payload.sub, email: payload.email, role };
    next();
  } catch {
    res.status(401).json({ error: 'Token non valido o scaduto' });
  }
}

const photoMutationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Troppe modifiche al catalogo foto. Attendi un minuto.' },
});

const app = express();
app.set('trust proxy', 1);
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = '/app/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 35 * 1024 * 1024 // 35 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato file non supportato. Carica un\'immagine JPG o PNG.'));
    }
  }
});

// Middleware helper per catturare errori di Multer in modo pulito
function handlePhotoUpload(req, res, next) {
  const uploadSingle = upload.single('file');
  uploadSingle(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'L\'immagine supera il limite massimo consentito di 35MB.' });
        }
        return res.status(400).json({ error: `Errore caricamento: ${err.message}` });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, service: 'photo-service', db: 'mysql' });
  } catch (e) {
    res.status(503).json({ ok: false, error: e.message });
  }
});

app.get('/photos', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, category, date_label AS \`date\`, src, description AS \`desc\`, uploaded_by_email
       FROM photos
       ORDER BY sort_order ASC, id ASC`,
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Errore lettura catalogo foto' });
  }
});

app.post('/photos', photoMutationLimiter, requirePhotoStaff, handlePhotoUpload, async (req, res) => {
  const title = String(req.body?.title ?? '').trim();
  const category = String(req.body?.category ?? '').trim();
  const dateLabel = String(req.body?.date ?? req.body?.date_label ?? '').trim();
  const description = String(req.body?.desc ?? req.body?.description ?? '').trim();
  
  let src = String(req.body?.src ?? '').trim();
  let fileToCleanup = null;

  if (req.file) {
    const inputPath = req.file.path;
    const webpFilename = req.file.filename.replace(/\.(png|jpe?g)$/i, '.webp');
    const webpPath = path.join(uploadDir, webpFilename);
    try {
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(webpPath);
      console.log(`[photo-service] Immagine convertita con successo in WebP: ${webpPath}`);
      
      // Delete original input image
      fs.unlinkSync(inputPath);
      
      // The WebP image is now the active file on disk
      src = `/uploads/${webpFilename}`;
      fileToCleanup = webpPath;

      // Quota check
      const stats = fs.statSync(webpPath);
      await checkAndLogUpload(stats.size);
    } catch (err) {
      console.error('[photo-service] Errore durante la conversione in WebP o superamento quota:', err);
      // Clean up both files
      try { fs.unlinkSync(inputPath); } catch (_) {}
      if (fileToCleanup && fs.existsSync(fileToCleanup)) {
        try { fs.unlinkSync(fileToCleanup); } catch (_) {}
      }
      res.status(400).json({ error: err.message || 'File immagine non valido o corrotto.' });
      return;
    }
  }

  if (!title || !category || !src || !dateLabel || !description) {
    // If validation fails, clean up the generated WebP file (if any)
    if (fileToCleanup && fs.existsSync(fileToCleanup)) {
      try { fs.unlinkSync(fileToCleanup); } catch (_) {}
    }
    res.status(400).json({ error: 'Campi obbligatori: title, category, date, src (o file), desc' });
    return;
  }

  try {
    let sortOrder = Number(req.body?.sort_order);
    if (!Number.isFinite(sortOrder)) {
      const [rows] = await pool.query('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_sort FROM photos');
      sortOrder = Number(rows[0].next_sort);
    }
    const [result] = await pool.query(
      `INSERT INTO photos (title, category, date_label, src, description, sort_order, uploaded_by_email)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, category, dateLabel, src, description, sortOrder, req.staff.email],
    );
    res.status(201).json({
      id: Number(result.insertId),
      title,
      category,
      date: dateLabel,
      src,
      desc: description,
      uploaded_by_email: req.staff.email,
    });
  } catch (e) {
    console.error(e);
    // If DB fails, clean up the generated WebP file
    if (fileToCleanup && fs.existsSync(fileToCleanup)) {
      try { fs.unlinkSync(fileToCleanup); } catch (_) {}
    }
    res.status(500).json({ error: 'Errore inserimento foto a database' });
  }
});

app.delete('/photos/:id', photoMutationLimiter, requirePhotoStaff, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'Id non valido' });
    return;
  }
  try {
    const [rows] = await pool.query('SELECT src FROM photos WHERE id = ?', [id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Foto non trovata' });
      return;
    }
    const src = rows[0].src;

    const [result] = await pool.query('DELETE FROM photos WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Foto non trovata' });
      return;
    }

    if (src && src.startsWith('/uploads/')) {
      const filename = src.replace(/^\/uploads\//, '');
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`[photo-service] File eliminato fisicamente: ${filePath}`);
        } catch (err) {
          console.error(`[photo-service] Errore eliminazione file: ${filePath}`, err);
        }
      }
      const webpPath = filePath.replace(/\.(png|jpe?g)$/i, '.webp');
      if (webpPath !== filePath && fs.existsSync(webpPath)) {
        try {
          fs.unlinkSync(webpPath);
          console.log(`[photo-service] File WebP clonato eliminato fisicamente: ${webpPath}`);
        } catch (err) {}
      }
    }

    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Errore eliminazione foto' });
  }
});

const port = Number(process.env.PORT) || 4001;

async function migratePhotoSchema() {
  const [cols] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'photos' AND COLUMN_NAME = 'uploaded_by_email'`,
    [MYSQL_DATABASE]
  );
  if (!cols.length) {
    await pool.query(`ALTER TABLE photos ADD COLUMN uploaded_by_email VARCHAR(255) NULL`);
    console.log('[photo-service] colonna photos.uploaded_by_email aggiunta');
  }
}

waitForMysql()
  .then(() => migratePhotoSchema())
  .then(() => {
    app.listen(port, '0.0.0.0', () => {
      console.log(`photo-service in ascolto sulla porta ${port} (MySQL: ${MYSQL_HOST}/${MYSQL_DATABASE})`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
