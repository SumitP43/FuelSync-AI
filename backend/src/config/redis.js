const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = () => {
  if (!process.env.REDIS_URL) {
    logger.warn('REDIS_URL not set – caching disabled');
    return null;
  }
  const client = new Redis(process.env.REDIS_URL, {
    lazyConnect: true,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });
  client.on('connect', () => logger.info('Redis connected'));
  client.on('error', (err) => logger.error(`Redis error: ${err.message}`));
  redisClient = client;
  return client;
};

const getRedis = () => redisClient;

module.exports = { connectRedis, getRedis };
