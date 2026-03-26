const Pump = require('../models/Pump');
const User = require('../models/User');
const mapsService = require('./googleMapsService');

/**
 * Weighted scoring model:
 * Score = (W_DISTANCE × distanceScore) + (W_WAIT × waitTimeScore) + (W_RATING × ratingScore)
 *
 * When GOOGLE_MAPS_API_KEY is configured, real drive distances (km) and drive
 * durations (min) replace the straight-line Haversine values, giving a
 * significantly more accurate recommendation.
 *
 * All component scores are normalised to [0, 1] where 1 = best.
 */

const W_DISTANCE = 0.3;
const W_WAIT = 0.5;
const W_RATING = 0.2;

// Lower value → higher score (distance, wait time)
const normalizeInverse = (value, min, max) => {
  if (max === min) return 1;
  return 1 - (value - min) / (max - min);
};

// Higher value → higher score (rating)
const normalizeAscending = (value, min, max) => {
  if (max === min) return 1;
  return (value - min) / (max - min);
};

/** Predicted effective wait time accounting for current queue. */
const effectiveWait = (pump) => pump.avgWaitingTimeMin + pump.queueLength * 0.5;

/**
 * Main recommendation function.
 *
 * @param {{ lat, lng, radius, limit, userId }} options
 */
const recommend = async ({ lat, lng, radius, limit, userId }) => {
  // 1. Fetch candidate pumps via geospatial query
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

  if (!pumps.length) return { bestPump: null, ranked: [], count: 0, mapsEnriched: false };

  // 2. Optionally enrich with real drive distances via Google Distance Matrix
  let mapsEnriched = false;
  if (mapsService.isAvailable()) {
    const destinations = pumps.map((p) => ({
      lat: p.location.coordinates[1],
      lng: p.location.coordinates[0],
    }));
    const matrix = await mapsService.getDistanceMatrix({ lat, lng }, destinations);
    if (matrix) {
      mapsEnriched = true;
      matrix.forEach((entry, i) => {
        if (entry) {
          // Override straight-line distance with actual drive distance
          pumps[i].distanceKm = entry.distanceKm;
          // Override heuristic wait with real drive duration + queue wait
          pumps[i].driveDistanceKm = entry.distanceKm;
          pumps[i].driveDurationMin = entry.durationMin;
          pumps[i].driveDistanceText = entry.distanceText;
          pumps[i].driveDurationText = entry.durationText;
        }
      });
    }
  }

  // 3. Compute scoring inputs
  const distances = pumps.map((p) => p.distanceKm);
  // When Maps-enriched, factor in actual drive time alongside queue wait
  const waits = pumps.map((p) =>
    mapsEnriched && p.driveDurationMin != null
      ? p.driveDurationMin + p.queueLength * 0.5
      : effectiveWait(p)
  );
  const ratings = pumps.map((p) => p.avgRating || 0);

  const minDist = Math.min(...distances);
  const maxDist = Math.max(...distances);
  const minWait = Math.min(...waits);
  const maxWait = Math.max(...waits);
  const minRating = Math.min(...ratings);
  const maxRating = Math.max(...ratings);

  // 4. Score each pump
  const scored = pumps.map((p, i) => {
    const dScore = normalizeInverse(distances[i], minDist, maxDist);
    const wScore = normalizeInverse(waits[i], minWait, maxWait);
    const rScore = normalizeAscending(ratings[i], minRating, maxRating);
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

  return { bestPump: ranked[0].pump, ranked, count: ranked.length, mapsEnriched };
};

/**
 * Record the pump a user actually chose (self-learning).
 *
 * @param {string} userId
 * @param {string} pumpId
 * @param {number} rank  - Position in the ranked list the user selected (1-based)
 */
const recordChoice = async (userId, pumpId, rank) => {
  await User.findByIdAndUpdate(userId, {
    $push: { choiceHistory: { pumpId, recommendedRank: rank, chosenAt: new Date() } },
  });
};

module.exports = { recommend, recordChoice };
