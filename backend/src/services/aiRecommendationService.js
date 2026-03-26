const Pump = require('../models/Pump');
const User = require('../models/User');

/**
 * Weighted scoring:
 * Score = (0.3 × distanceScore) + (0.5 × waitTimeScore) + (0.2 × ratingScore)
 * All scores normalized 0-1 (1 = best).
 */

const W_DISTANCE = 0.3;
const W_WAIT = 0.5;
const W_RATING = 0.2;

const normalize = (value, min, max) => {
  if (max === min) return 1;
  return 1 - (value - min) / (max - min);
};

const normalizeRating = (value, min, max) => {
  if (max === min) return 1;
  return (value - min) / (max - min);
};

const movingAvgWaitTime = (pump) => {
  return pump.avgWaitingTimeMin + pump.queueLength * 0.5;
};

const recommend = async ({ lat, lng, radius, limit, userId }) => {
  const pumps = await Pump.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng, lat] },
        distanceField: 'distanceMeters',
        maxDistance: radius * 1000,
        spherical: true,
        query: { isActive: true, status: 'open' },
      },
    },
    { $addFields: { distanceKm: { $divide: ['$distanceMeters', 1000] } } },
    { $limit: 50 },
  ]);

  if (!pumps.length) return { bestPump: null, ranked: [], count: 0 };

  const distances = pumps.map((p) => p.distanceKm);
  const waits = pumps.map((p) => movingAvgWaitTime(p));
  const ratings = pumps.map((p) => p.avgRating || 0);

  const minDist = Math.min(...distances), maxDist = Math.max(...distances);
  const minWait = Math.min(...waits), maxWait = Math.max(...waits);
  const minRating = Math.min(...ratings), maxRating = Math.max(...ratings);

  const scored = pumps.map((p) => {
    const dScore = normalize(p.distanceKm, minDist, maxDist);
    const wScore = normalize(movingAvgWaitTime(p), minWait, maxWait);
    const rScore = normalizeRating(p.avgRating || 0, minRating, maxRating);
    const totalScore = W_DISTANCE * dScore + W_WAIT * wScore + W_RATING * rScore;
    return {
      pump: p,
      score: Math.round(totalScore * 100) / 100,
      breakdown: {
        distanceScore: Math.round(dScore * 100) / 100,
        waitTimeScore: Math.round(wScore * 100) / 100,
        ratingScore: Math.round(rScore * 100) / 100,
      },
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const ranked = scored.slice(0, limit);

  return { bestPump: ranked[0].pump, ranked, count: ranked.length };
};

const recordChoice = async (userId, pumpId, rank) => {
  await User.findByIdAndUpdate(userId, {
    $push: {
      choiceHistory: { pumpId, recommendedRank: rank, chosenAt: new Date() },
    },
  });
};

module.exports = { recommend, recordChoice };
