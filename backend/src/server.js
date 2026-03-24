require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const { defaultLimiter } = require('./middleware/rateLimiter');

// Routes
const pumpsRouter = require('./routes/pumps');
const predictionsRouter = require('./routes/predictions');
const recommendationsRouter = require('./routes/recommendations');
const feedbackRouter = require('./routes/feedback');
const crowdReportsRouter = require('./routes/crowd-reports');
const authRouter = require('./routes/auth');

const app = express();

// Security & request parsing
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api', defaultLimiter);

// API Routes
app.use('/api/pumps', pumpsRouter);
app.use('/api/predictions', predictionsRouter);
app.use('/api/prediction-graph', predictionsRouter); // alias
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/crowd-report', crowdReportsRouter);
app.use('/api/auth', authRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FuelSync-AI Backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = parseInt(process.env.PORT || '5000');

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 FuelSync-AI Backend running on port ${PORT}`);
    });
  });
}

module.exports = app;
