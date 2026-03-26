require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('./config/passport');

const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');
const logger = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { defaultLimiter } = require('./middleware/rateLimiter');
const initSocket = require('./sockets');

// Jobs
const startExpireJob = require('./jobs/expireBookings');
const startPredictionJob = require('./jobs/updatePredictions');
const startDailyAnalyticsJob = require('./jobs/dailyAnalytics');

// Validate critical environment variables before starting
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

if (!process.env.GOOGLE_MAPS_API_KEY) {
  console.warn('GOOGLE_MAPS_API_KEY not set – drive distances and directions will use straight-line fallback');
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*', methods: ['GET', 'POST'] },
});

// Make io available in controllers
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(passport.initialize());

// Rate limiting
app.use('/api', defaultLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pumps', require('./routes/pumps'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check
app.get('/health', (_req, res) =>
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    googleMaps: Boolean(process.env.GOOGLE_MAPS_API_KEY),
  })
);

// 404
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use(errorHandler);

// Socket.io
initSocket(io);

// Start server
const PORT = process.env.PORT || 5000;
const start = async () => {
  await connectDB();
  try {
    connectRedis();
  } catch (err) {
    logger.warn(`Redis not available – caching disabled: ${err.message}`);
  }
  startExpireJob();
  startPredictionJob();
  startDailyAnalyticsJob();
  server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
};

start().catch((err) => {
  logger.error(`Server startup error: ${err.message}`);
  process.exit(1);
});

module.exports = { app, server };
