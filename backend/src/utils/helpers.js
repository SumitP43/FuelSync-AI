const crypto = require('crypto');

const paginate = (query, page = 1, limit = 10) => {
  const skip = (Number(page) - 1) * Number(limit);
  return query.skip(skip).limit(Number(limit));
};

const generateToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const normalizeScore = (value, min, max) => {
  if (max === min) return 1;
  return (value - min) / (max - min);
};

module.exports = { paginate, generateToken, normalizeScore };
