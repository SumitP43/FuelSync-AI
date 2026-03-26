const Booking = require('../models/Booking');
const logger = require('../utils/logger');

const expireOldBookings = async () => {
  const now = new Date();
  const result = await Booking.updateMany(
    { status: 'active', expiresAt: { $lt: now } },
    { status: 'expired' }
  );
  if (result.modifiedCount > 0) {
    logger.info(`Expired ${result.modifiedCount} bookings`);
  }
  return result.modifiedCount;
};

module.exports = { expireOldBookings };
