const cron = require('node-cron');
const Pump = require('../models/Pump');
const logger = require('../utils/logger');

const startPredictionJob = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const pumps = await Pump.find({ isActive: true });
      for (const pump of pumps) {
        const hour = new Date().getHours();
        const peakHours = [7, 8, 9, 17, 18, 19];
        const mult = peakHours.includes(hour) ? 1.3 : 0.9;
        pump.avgWaitingTimeMin = Math.max(1, Math.round(pump.avgWaitingTimeMin * mult));
        await pump.save();
      }
      logger.info('[Job] Updated wait time predictions');
    } catch (err) {
      logger.error(`[Job] updatePredictions error: ${err.message}`);
    }
  });
  logger.info('[Job] updatePredictions started');
};

module.exports = startPredictionJob;
