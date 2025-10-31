const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por IP por ventana de tiempo
});

// Middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taxbridge');

mongoose.connection.on('connected', () => {
  console.log('✅ Conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error de conexión a MongoDB:', err);
});

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'TaxBridge API v1.0',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// API Routes
// app.use('/api/auth', require('./routes/auth'));
// app.Guse('/api/users', require('./routes/users'));
// app.use('/api/taxes', require('./routes/taxes'));

// --- RUTA DE TESTIMONIOS AÑADIDA ---+
const testimonialRoutes = require('./routes/testimonial.routes');
app.use('/api/testimonials', testimonialRoutes);
// ------------------------------------

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Algo salió mal!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
});

module.exports = app;

