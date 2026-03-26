const cron = require('node-cron');
const { expireOldBookings } = require('../services/bookingService');
const logger = require('../utils/logger');

const startExpireJob = () => {
  cron.schedule('*/15 * * * *', async () => {
    try {
      const count = await expireOldBookings();
      if (count > 0) logger.info(`[Job] Expired ${count} bookings`);
    } catch (err) {
      logger.error(`[Job] expireBookings error: ${err.message}`);
    }
  });
  logger.info('[Job] expireBookings started');
};

module.exports = startExpireJob;
