const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) =>
  rateLimit({ windowMs, max, message: { success: false, message }, standardHeaders: true, legacyHeaders: false });

exports.defaultLimiter = createLimiter(15 * 60 * 1000, 100, 'Too many requests, please try again later');
exports.authLimiter = createLimiter(15 * 60 * 1000, 20, 'Too many auth attempts, please try again later');
exports.strictLimiter = createLimiter(60 * 1000, 10, 'Rate limit exceeded');
