const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('./errorHandler');

exports.protect = asyncHandler(async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  const token = auth.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  if (!req.user || !req.user.isActive) {
    return res.status(401).json({ success: false, message: 'User not found or inactive' });
  }
  next();
});

exports.optionalAuth = asyncHandler(async (req, _res, next) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch (_) { /* ignore */ }
  }
  next();
});

exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden – insufficient role' });
  }
  next();
};
