const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const logger = require('./utils/logger');
const rateLimiter = require('./middleware/rateLimiter');
const cache = require('./services/cache');

// Import routes
const searchRoutes = require('./routes/search');
const pizzeriasRoutes = require('./routes/pizzerias');

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Rate limiting
app.use('/api/', rateLimiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/search', searchRoutes);
app.use('/api/pizzerias', pizzeriasRoutes);

// Serve static frontend files
app.use(express.static('public'));

// Root endpoint
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/../public/index.html');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: config.server.env === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

// Initialize services and start server
async function start() {
  try {
    // Initialize Redis cache
    await cache.initializeRedis();
    logger.info('Cache initialized');

    // Start server
    app.listen(config.server.port, () => {
      logger.info(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🍕 Pizzeria Search API Server                      ║
║                                                       ║
║   Environment: ${config.server.env.padEnd(35)}      ║
║   Port: ${config.server.port.toString().padEnd(42)}      ║
║   Google Places: ${(config.apis.google.enabled ? '✓ Enabled' : '✗ Disabled').padEnd(34)}      ║
║   Yelp Fusion: ${(config.apis.yelp.enabled ? '✓ Enabled' : '✗ Disabled').padEnd(36)}      ║
║                                                       ║
║   API Endpoints:                                      ║
║   - POST /api/search/zipcode                          ║
║   - GET  /api/search/zipcode/:zipcode                 ║
║   - GET  /api/pizzerias/:id                           ║
║   - POST /api/pizzerias/batch                         ║
║   - GET  /api/pizzerias                               ║
║                                                       ║
║   Health Check: GET /health                           ║
║   Frontend: http://localhost:${config.server.port.toString().padEnd(24)}      ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
start();

module.exports = app;
