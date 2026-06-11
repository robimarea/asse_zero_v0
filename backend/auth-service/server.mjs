import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import crypto from 'crypto';

const {
  MYSQL_HOST = '127.0.0.1',
  MYSQL_PORT = '3306',
  MYSQL_USER = 'assezero',
  MYSQL_PASSWORD = 'appsecret',
  MYSQL_DATABASE = 'auth_svc',
  JWT_SECRET = 'dev_jwt_secret_change_in_production',
  JWT_EXPIRES_IN = '8h',
  DEFAULT_ADMIN_EMAIL = 'admin@assezero.local',
  DEFAULT_ADMIN_PASSWORD = 'admin_dev_change_me',
  DEFAULT_EDITOR_EMAIL = 'editor@assezero.local',
  DEFAULT_EDITOR_PASSWORD = 'editor_dev_change_me',
  PORT = '4003',
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
      console.warn(`[auth-service] MySQL non pronto (${i + 1}/${attempts}): ${err.message}`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error('Impossibile connettersi a MySQL');
}

async function migrateAuthSchema() {
  const [cols] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'admins' AND COLUMN_NAME = 'role'`,
    [MYSQL_DATABASE],
  );
  if (!cols.length) {
    await pool.query(
      `ALTER TABLE admins ADD COLUMN role VARCHAR(32) NOT NULL DEFAULT 'admin' AFTER password_hash`,
    );
    console.log('[auth-service] colonna admins.role aggiunta');
  }
  const [cols2] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'admins' AND COLUMN_NAME = 'last_login_at'`,
    [MYSQL_DATABASE],
  );
  if (!cols2.length) {
    await pool.query(
      `ALTER TABLE admins ADD COLUMN last_login_at TIMESTAMP NULL AFTER created_at`,
    );
    console.log('[auth-service] colonna admins.last_login_at aggiunta');
  }
  const [cols3] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'admins' AND COLUMN_NAME = 'last_seen_at'`,
    [MYSQL_DATABASE],
  );
  if (!cols3.length) {
    await pool.query(
      `ALTER TABLE admins ADD COLUMN last_seen_at TIMESTAMP NULL AFTER last_login_at`,
    );
    console.log('[auth-service] colonna admins.last_seen_at aggiunta');
  }
  const [cols4] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'admins' AND COLUMN_NAME = 'is_online'`,
    [MYSQL_DATABASE],
  );
  if (!cols4.length) {
    await pool.query(
      `ALTER TABLE admins ADD COLUMN is_online TINYINT(1) NOT NULL DEFAULT 0 AFTER last_seen_at`,
    );
    console.log('[auth-service] colonna admins.is_online aggiunta');
  }

  // Creazione tabella token_blacklist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS token_blacklist (
      token_hash VARCHAR(64) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      PRIMARY KEY (token_hash),
      KEY idx_blacklist_expiry (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('[auth-service] tabella token_blacklist verificata/creata');

  // Creazione tabella upload_logs
  await pool.query(`
    CREATE TABLE IF NOT EXISTS upload_logs (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      file_size_bytes BIGINT NOT NULL,
      uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_upload_logs_time (uploaded_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('[auth-service] tabella upload_logs verificata/creata');
}

async function ensureDefaultUsers() {
  await migrateAuthSchema();
  const [countRows] = await pool.query('SELECT COUNT(*) AS c FROM admins');
  const c = Number(countRows[0].c);
  if (c === 0) {
    const hash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
    await pool.query('INSERT INTO admins (email, password_hash, role) VALUES (?, ?, ?)', [
      DEFAULT_ADMIN_EMAIL,
      hash,
      'admin',
    ]);
    console.log(`[auth-service] creato admin: ${DEFAULT_ADMIN_EMAIL}`);
  }
  const [editorRows] = await pool.query('SELECT id FROM admins WHERE email = ? LIMIT 1', [DEFAULT_EDITOR_EMAIL]);
  if (!editorRows.length) {
    const hash = await bcrypt.hash(DEFAULT_EDITOR_PASSWORD, 10);
    await pool.query('INSERT INTO admins (email, password_hash, role) VALUES (?, ?, ?)', [
      DEFAULT_EDITOR_EMAIL,
      hash,
      'editor',
    ]);
    console.log(`[auth-service] creato editor: ${DEFAULT_EDITOR_EMAIL}`);
  }
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function isTokenBlacklisted(token) {
  const hash = hashToken(token);
  const [rows] = await pool.query('SELECT 1 FROM token_blacklist WHERE token_hash = ? LIMIT 1', [hash]);
  return rows.length > 0;
}

function bearerToken(req) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return null;
  return h.slice(7).trim();
}

async function requireAuth(req, res, next) {
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
      res.status(403).json({ error: 'Ruolo non autorizzato' });
      return;
    }
    req.user = { id: String(payload.sub), email: payload.email, role };
    next();
  } catch {
    res.status(401).json({ error: 'Token non valido o scaduto' });
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      res.status(403).json({ error: 'Operazione riservata agli admin' });
      return;
    }
    next();
  });
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Troppi tentativi di accesso. Riprova tra qualche minuto.' },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

const app = express();
app.set('trust proxy', 1);
app.use(compression());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(apiLimiter);

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, service: 'auth-service', db: 'mysql' });
  } catch (e) {
    res.status(503).json({ ok: false, error: e.message });
  }
});

app.post('/login', loginLimiter, async (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');
  if (!email || !password) {
    res.status(400).json({ error: 'Email e password obbligatorie' });
    return;
  }
  try {
    const [rows] = await pool.query(
      'SELECT id, email, password_hash, role FROM admins WHERE email = ? LIMIT 1',
      [email],
    );
    const row = rows[0];
    if (!row || !(await bcrypt.compare(password, row.password_hash))) {
      res.status(401).json({ error: 'Credenziali non valide' });
      return;
    }
    const role = row.role === 'editor' ? 'editor' : 'admin';
    
    await pool.query('UPDATE admins SET last_login_at = NOW(), last_seen_at = NOW(), is_online = 1 WHERE id = ?', [row.id]);
    
    const token = jwt.sign(
      { sub: String(row.id), email: row.email, role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );
    res.json({
      token,
      expiresIn: JWT_EXPIRES_IN,
      admin: { id: row.id, email: row.email, role },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Errore durante il login' });
  }
});

app.post('/logout', requireAuth, async (req, res) => {
  const token = bearerToken(req);
  if (token) {
    try {
      const hash = hashToken(token);
      let expiresAt = new Date();
      try {
        const payload = jwt.decode(token);
        if (payload && payload.exp) {
          expiresAt = new Date(payload.exp * 1000);
        } else {
          expiresAt.setHours(expiresAt.getHours() + 8);
        }
      } catch (_) {
        expiresAt.setHours(expiresAt.getHours() + 8);
      }
      await pool.query(
        'INSERT IGNORE INTO token_blacklist (token_hash, expires_at) VALUES (?, ?)',
        [hash, expiresAt]
      );
    } catch (err) {
      console.error('Errore durante la blacklist del token:', err);
    }
  }

  try {
    await pool.query('UPDATE admins SET is_online = 0, last_seen_at = NOW() WHERE id = ?', [req.user.id]);
  } catch (e) {
    console.error('Errore update logout:', e);
  }
  res.json({ ok: true });
});

app.post('/ping', requireAuth, async (req, res) => {
  try {
    await pool.query('UPDATE admins SET last_seen_at = NOW(), is_online = 1 WHERE id = ?', [req.user.id]);
    res.json({ ok: true });
  } catch (e) {
    console.error('Errore update ping:', e);
    res.status(500).json({ error: 'Errore ping' });
  }
});

app.get('/me', requireAuth, (req, res) => {
  res.json({ admin: { id: req.user.id, email: req.user.email, role: req.user.role } });
});

app.get('/users', apiLimiter, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, email, role, created_at, last_login_at, last_seen_at, is_online FROM admins ORDER BY role ASC, id ASC'
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Errore caricamento utenti' });
  }
});

// Cleanup orario blacklist token scaduti
setInterval(async () => {
  try {
    await pool.query('DELETE FROM token_blacklist WHERE expires_at < NOW()');
    console.log('[auth-service] Cleanup token blacklist scaduti completato.');
  } catch (err) {
    console.error('[auth-service] Errore cleanup blacklist:', err);
  }
}, 60 * 60 * 1000);

const port = Number(PORT) || 4003;

waitForMysql()
  .then(() => ensureDefaultUsers())
  .then(() => {
    app.listen(port, '0.0.0.0', () => {
      console.log(`auth-service in ascolto sulla porta ${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
