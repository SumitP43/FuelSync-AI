const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  const { username, email, password } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Username or email already exists' });
  }

  const password_hash = await bcrypt.hash(password, 12);
  const user = await User.create({ username, email, password_hash });

  const token = signToken(user._id);
  res.status(201).json({
    success: true,
    token,
    user: { id: user._id, username: user.username, email: user.email },
  });
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password_hash');
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  user.last_login = new Date();
  await user.save();

  const token = signToken(user._id);
  res.json({
    success: true,
    token,
    user: { id: user._id, username: user.username, email: user.email },
  });
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { register, login, getMe };
