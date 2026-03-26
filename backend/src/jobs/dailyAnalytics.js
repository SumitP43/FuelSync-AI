const cron = require('node-cron');
const analyticsService = require('../services/analyticsService');
const logger = require('../utils/logger');

const startDailyAnalyticsJob = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const report = await analyticsService.dailyReport(1);
      logger.info('[Job] Daily analytics report generated', { report });
    } catch (err) {
      logger.error(`[Job] dailyAnalytics error: ${err.message}`);
    }
  });
  logger.info('[Job] dailyAnalytics started');
};

module.exports = startDailyAnalyticsJob;
