import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const {
  MYSQL_HOST = '127.0.0.1',
  MYSQL_PORT = '3306',
  MYSQL_USER = 'assezero',
  MYSQL_PASSWORD = 'appsecret',
  MYSQL_DATABASE = 'videos_svc',
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

const app = express();
app.use(cors());
app.use(express.json());

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
      `SELECT id, label, date_label AS \`date\`, url, description AS \`desc\`
       FROM videos
       ORDER BY sort_order ASC, id ASC`,
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Errore lettura catalogo video' });
  }
});

const port = Number(process.env.PORT) || 4002;

waitForMysql()
  .then(() => {
    app.listen(port, '0.0.0.0', () => {
      console.log(`video-service in ascolto sulla porta ${port} (MySQL: ${MYSQL_HOST}/${MYSQL_DATABASE})`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
