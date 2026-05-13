import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

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

function bearerToken(req) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return null;
  return h.slice(7).trim();
}

/** Solo admin o editor possono modificare il catalogo foto. */
function requirePhotoStaff(req, res, next) {
  const token = bearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Token mancante' });
    return;
  }
  try {
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
app.use(cors());
app.use(express.json());

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
      `SELECT id, title, category, date_label AS \`date\`, src, description AS \`desc\`
       FROM photos
       ORDER BY sort_order ASC, id ASC`,
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Errore lettura catalogo foto' });
  }
});

app.post('/photos', photoMutationLimiter, requirePhotoStaff, async (req, res) => {
  const title = String(req.body?.title ?? '').trim();
  const category = String(req.body?.category ?? '').trim();
  const src = String(req.body?.src ?? '').trim();
  const dateLabel = String(req.body?.date ?? req.body?.date_label ?? '').trim();
  const description = String(req.body?.desc ?? req.body?.description ?? '').trim();
  if (!title || !category || !src || !dateLabel || !description) {
    res.status(400).json({ error: 'Campi obbligatori: title, category, date, src, desc' });
    return;
  }
  try {
    let sortOrder = Number(req.body?.sort_order);
    if (!Number.isFinite(sortOrder)) {
      const [rows] = await pool.query('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_sort FROM photos');
      sortOrder = Number(rows[0].next_sort);
    }
    const [result] = await pool.query(
      `INSERT INTO photos (title, category, date_label, src, description, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, category, dateLabel, src, description, sortOrder],
    );
    res.status(201).json({
      id: Number(result.insertId),
      title,
      category,
      date: dateLabel,
      src,
      desc: description,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Errore inserimento foto' });
  }
});

app.delete('/photos/:id', photoMutationLimiter, requirePhotoStaff, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'Id non valido' });
    return;
  }
  try {
    const [result] = await pool.query('DELETE FROM photos WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Foto non trovata' });
      return;
    }
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Errore eliminazione foto' });
  }
});

const port = Number(process.env.PORT) || 4001;

waitForMysql()
  .then(() => {
    app.listen(port, '0.0.0.0', () => {
      console.log(`photo-service in ascolto sulla porta ${port} (MySQL: ${MYSQL_HOST}/${MYSQL_DATABASE})`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
