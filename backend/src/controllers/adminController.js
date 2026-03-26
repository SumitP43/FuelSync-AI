const User = require('../models/User');
const Pump = require('../models/Pump');
const Booking = require('../models/Booking');
const analyticsService = require('../services/analyticsService');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getDashboard = asyncHandler(async (_req, res) => {
  const [totalUsers, activePumps, todayBookings, totalBookings] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Pump.countDocuments({ isActive: true, status: 'open' }),
    Booking.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
    Booking.countDocuments(),
  ]);
  res.json({ success: true, dashboard: { totalUsers, activePumps, todayBookings, totalBookings } });
});

exports.getPeakHours = asyncHandler(async (req, res) => {
  const { pumpId } = req.query;
  const data = await analyticsService.peakHours(pumpId);
  res.json({ success: true, peakHours: data });
});

exports.getPumpPerformance = asyncHandler(async (_req, res) => {
  const data = await analyticsService.pumpPerformance();
  res.json({ success: true, rankings: data });
});

exports.getAnalyticsReport = asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;
  const data = await analyticsService.dailyReport(parseInt(days, 10));
  res.json({ success: true, report: data });
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const total = await User.countDocuments();
  const users = await User.find()
    .select('-password -refreshTokens')
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));
  res.json({ success: true, total, users });
});
