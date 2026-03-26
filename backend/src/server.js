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

const startExpireJob = require('./jobs/expireBookings');
const startPredictionJob = require('./jobs/updatePredictions');
const startDailyAnalyticsJob = require('./jobs/dailyAnalytics');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*', methods: ['GET', 'POST'] },
});

app.set('io', io);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(passport.initialize());

app.use('/api', defaultLimiter);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/pumps', require('./routes/pumps'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

app.use(errorHandler);

initSocket(io);

const PORT = process.env.PORT || 5000;
const start = async () => {
  await connectDB();
  connectRedis();
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
