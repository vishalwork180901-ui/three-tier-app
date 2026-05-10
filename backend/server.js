// ── Tier 2: Backend API ───────────────────────────
// In Kubernetes, DB_HOST comes from environment variable
// which points to the mysql-service or postgres-service

const express = require('express');
const cors    = require('cors');
const { Pool } = require('pg');

const app  = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// DB connection — host comes from K8s environment variable
const db = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'mystore',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'mypassword',
});

// Auto-create table on startup
async function initDB() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id        SERIAL PRIMARY KEY,
        name      VARCHAR(200) NOT NULL,
        price     DECIMAL(10,2) NOT NULL,
        category  VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Database table ready');
  } catch (err) {
    console.error('❌ DB init failed:', err.message);
  }
}

// ── Routes ──────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', tier: 'Backend (Node.js)', db_host: process.env.DB_HOST });
});

app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM products ORDER BY id DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const { rows } = await db.query(
      'INSERT INTO products (name, price, category) VALUES ($1,$2,$3) RETURNING *',
      [name, price, category]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Start ────────────────────────────────────────
app.listen(PORT, async () => {
  await initDB();
  console.log(`✅ Backend API running on port ${PORT}`);
  console.log(`   DB_HOST = ${process.env.DB_HOST || 'localhost'}`);
});
