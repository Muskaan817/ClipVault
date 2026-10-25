const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDb } = require('./db');
const clipRoutes = require('./routes/clipRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ClipVault Backend',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/clips', clipRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, async () => {
  console.log(`ClipVault backend listening on http://localhost:${PORT}`);
  await initDb();
});

module.exports = app;
