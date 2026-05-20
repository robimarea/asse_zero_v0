import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const {
  MYSQL_HOST = '127.0.0.1',
  MYSQL_PORT = '3306',
  MYSQL_USER = 'assezero',
  MYSQL_PASSWORD = 'appsecret',
  MYSQL_DATABASE = 'videos_svc',
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
      console.warn(`[video-service] MySQL non pronto (${i + 1}/${attempts}): ${err.message}`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error('Impossibile connettersi a MySQL');
}

function bearerToken(req) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return null;
  return h.slice(7).trim();
}

function requireVideoStaff(req, res, next) {
  const token = bearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Token mancante' });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const role = payload.role;
    if (role !== 'admin' && role !== 'editor') {
      res.status(403).json({ error: 'Solo staff autorizzato sui video' });
      return;
    }
    req.staff = { id: payload.sub, email: payload.email, role };
    next();
  } catch {
    res.status(401).json({ error: 'Token non valido o scaduto' });
  }
}

const videoMutationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Troppe modifiche al catalogo video. Attendi un minuto.' },
});

const app = express();
app.set('trust proxy', 1);
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
const upload = multer({ storage });

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, service: 'video-service', db: 'mysql' });
  } catch (e) {
    res.status(503).json({ ok: false, error: e.message });
  }
});

app.get('/videos', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, label, date_label AS \`date\`, url, description AS \`desc\`, uploaded_by_email
       FROM videos
       ORDER BY sort_order ASC, id ASC`,
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Errore lettura catalogo video' });
  }
});

app.post('/videos', videoMutationLimiter, requireVideoStaff, upload.single('file'), async (req, res) => {
  const label = String(req.body?.label ?? req.body?.title ?? '').trim();
  const dateLabel = String(req.body?.date ?? req.body?.date_label ?? '').trim();
  const description = String(req.body?.desc ?? req.body?.description ?? '').trim();
  
  let url = String(req.body?.url ?? req.body?.src ?? '').trim();
  if (req.file) {
    url = `/uploads/${req.file.filename}`;
  }

  if (!label || !url || !dateLabel || !description) {
    res.status(400).json({ error: 'Campi obbligatori: label, date, url (o file), desc' });
    return;
  }
  try {
    let sortOrder = Number(req.body?.sort_order);
    if (!Number.isFinite(sortOrder)) {
      const [rows] = await pool.query('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_sort FROM videos');
      sortOrder = Number(rows[0].next_sort);
    }
    
    // id is NOT auto_increment in videos table, we must calculate MAX(id) + 1
    const [idRows] = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM videos');
    const newId = Number(idRows[0].next_id);
    
    await pool.query(
      `INSERT INTO videos (id, label, date_label, url, description, sort_order, uploaded_by_email)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [newId, label, dateLabel, url, description, sortOrder, req.staff.email],
    );
    res.status(201).json({
      id: newId,
      label,
      date: dateLabel,
      url,
      desc: description,
      uploaded_by_email: req.staff.email,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Errore inserimento video' });
  }
});

app.delete('/videos/:id', videoMutationLimiter, requireVideoStaff, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'Id non valido' });
    return;
  }
  try {
    const [result] = await pool.query('DELETE FROM videos WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Video non trovato' });
      return;
    }
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Errore eliminazione video' });
  }
});

const port = Number(process.env.PORT) || 4002;

async function migrateVideoSchema() {
  const [cols] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'videos' AND COLUMN_NAME = 'uploaded_by_email'`,
    [MYSQL_DATABASE]
  );
  if (!cols.length) {
    await pool.query(`ALTER TABLE videos ADD COLUMN uploaded_by_email VARCHAR(255) NULL`);
    console.log('[video-service] colonna videos.uploaded_by_email aggiunta');
  }
}

waitForMysql()
  .then(() => migrateVideoSchema())
  .then(() => {
    app.listen(port, '0.0.0.0', () => {
      console.log(`video-service in ascolto sulla porta ${port} (MySQL: ${MYSQL_HOST}/${MYSQL_DATABASE})`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
