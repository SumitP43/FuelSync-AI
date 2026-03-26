const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateToken } = require('../utils/helpers');

const signAccess = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '15m' });
const signRefresh = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({ name, email, password, role: role || 'user' });
  const accessToken = signAccess(user._id);
  const refreshToken = signRefresh(user._id);
  await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: refreshToken } });
  res.status(201).json({ success: true, accessToken, refreshToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password +refreshTokens');
  if (!user || !user.password || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  const accessToken = signAccess(user._id);
  const refreshToken = signRefresh(user._id);
  user.refreshTokens.push(refreshToken);
  user.lastLogin = new Date();
  await user.save();
  res.json({ success: true, accessToken, refreshToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user || !user.refreshTokens.includes(refreshToken)) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
  const newAccess = signAccess(user._id);
  const newRefresh = signRefresh(user._id);
  user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
  user.refreshTokens.push(newRefresh);
  await user.save();
  res.json({ success: true, accessToken: newAccess, refreshToken: newRefresh });
});

exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await User.findByIdAndUpdate(req.user._id, { $pull: { refreshTokens: refreshToken } });
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

exports.googleCallback = asyncHandler(async (req, res) => {
  const user = req.user;
  const accessToken = signAccess(user._id);
  const refreshToken = signRefresh(user._id);
  await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: refreshToken } });
  res.redirect(`${process.env.CLIENT_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
});
