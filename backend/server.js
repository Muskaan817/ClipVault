const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDb } = require('./db');
const clipRoutes = require('./routes/clipRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ClipVault Backend',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/clips', clipRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server and initialize database table
app.listen(PORT, async () => {
  console.log(`ClipVault backend listening on http://localhost:${PORT}`);
  await initDb();
});

module.exports = app;
