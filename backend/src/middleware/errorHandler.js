const logger = require('../utils/logger');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const errorHandler = (err, req, res, _next) => {
  logger.error({ message: err.message, stack: err.stack, path: req.path });

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'CastError') { statusCode = 400; message = `Invalid ID: ${err.value}`; }
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }
  if (err.name === 'JsonWebTokenError') { statusCode = 401; message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError') { statusCode = 401; message = 'Token expired'; }

  res.status(statusCode).json({ success: false, message });
};

module.exports = { asyncHandler, errorHandler };
