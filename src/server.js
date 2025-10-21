const app = require('./app');
const connectDB = require('./config/database');
const cron = require('node-cron');
const axios = require('axios');

const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Admin API: http://localhost:${PORT}/api/admin`);
});


const HEALTH_URL = 'https://thakorfootwarebe.onrender.com/health';

cron.schedule('*/10 * * * *', async () => {
  try {
    const response = await axios.get(HEALTH_URL);
    console.log(`[CRON] Health ping successful: ${response.status} ${new Date().toISOString()}`);
  } catch (error) {
    console.error('[CRON] Health ping failed:', error.message);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', err);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception thrown:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});
