const Booking = require('../models/Booking');
const Pump = require('../models/Pump');
const mongoose = require('mongoose');

const peakHours = async (pumpId) => {
  const match = pumpId ? { pumpId: new mongoose.Types.ObjectId(pumpId) } : {};
  return Booking.aggregate([
    { $match: match },
    { $group: { _id: '$slotHour', bookings: { $sum: 1 } } },
    { $sort: { bookings: -1 } },
  ]);
};

const pumpPerformance = async () => {
  return Pump.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: 'bookings',
        localField: '_id',
        foreignField: 'pumpId',
        as: 'bookings',
      },
    },
    {
      $addFields: {
        totalBookings: { $size: '$bookings' },
        completedBookings: {
          $size: { $filter: { input: '$bookings', cond: { $eq: ['$$this.status', 'completed'] } } },
        },
      },
    },
    { $sort: { totalBookings: -1 } },
    { $limit: 20 },
    { $project: { bookings: 0 } },
  ]);
};

const dailyReport = async (days = 7) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  return Booking.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        total: { $sum: 1 },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

module.exports = { peakHours, pumpPerformance, dailyReport };
