const cron = require('node-cron');
const Pump = require('../models/Pump');
const logger = require('../utils/logger');

const startPredictionJob = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const hour = new Date().getHours();
      const peakHours = [7, 8, 9, 17, 18, 19];
      const mult = peakHours.includes(hour) ? 1.3 : 0.9;

      const pumps = await Pump.find({ isActive: true }, '_id avgWaitingTimeMin');
      const bulkOps = pumps.map((pump) => ({
        updateOne: {
          filter: { _id: pump._id },
          update: { $set: { avgWaitingTimeMin: Math.max(1, Math.round(pump.avgWaitingTimeMin * mult)) } },
        },
      }));

      if (bulkOps.length > 0) {
        await Pump.bulkWrite(bulkOps);
      }
      logger.info(`[Job] Updated wait time predictions for ${bulkOps.length} pumps`);
    } catch (err) {
      logger.error(`[Job] updatePredictions error: ${err.message}`);
    }
  });
  logger.info('[Job] updatePredictions started');
};

module.exports = startPredictionJob;
