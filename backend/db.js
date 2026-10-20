const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'clipvault',
    };

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

// Helper function to initialize schema if needed
const initDb = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS clips (
      id SERIAL PRIMARY KEY,
      content TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'text',
      is_pinned BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log('Database initialized successfully: "clips" table is ready');
  } catch (error) {
    console.error('Failed to initialize database table:', error.message);
  }
};

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  initDb,
};
