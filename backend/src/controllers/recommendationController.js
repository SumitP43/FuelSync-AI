const Pump = require('../models/Pump');
const CrowdReport = require('../models/CrowdReport');
const mlClient = require('../utils/mlClient');
const { filterPumpsByRadius } = require('../utils/geolocation');

/**
 * Smart recommendation scoring algorithm:
 * Score = (0.3 × distance_score) + (0.5 × wait_time_score) + (0.2 × rating_score)
 *
 * GET /api/recommendations?lat=X&lng=Y&radius=10
 */
const getRecommendations = async (req, res) => {
  const { lat, lng, radius = 15, limit = 5 } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ success: false, message: 'lat and lng are required' });
  }

  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  const radiusKm = Math.min(parseFloat(radius), 50);
  const resultLimit = Math.min(parseInt(limit), 10);

  const pumps = await Pump.find({ is_active: true }).lean();
  const nearby = filterPumpsByRadius(pumps, userLat, userLng, radiusKm);

  if (nearby.length === 0) {
    return res.json({ success: true, data: [], message: 'No pumps found in the specified radius' });
  }

  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay();

  // Get predictions for all nearby pumps
  const enriched = await Promise.all(
    nearby.map(async (pump) => {
      // Get latest crowd report
      const recentReport = await CrowdReport.findOne({ pump_id: pump._id })
        .sort({ timestamp: -1 })
        .lean();
      const crowd_level = recentReport ? recentReport.crowd_level : pump.current_crowd_level || 2;

      // Predict wait time
      let predicted_wait;
      let confidence = 0.75;
      try {
        const pred = await mlClient.predictWaitTime({
          hour,
          day_of_week: dayOfWeek,
          historical_avg_wait: pump.historical_avg_wait || 20,
          crowd_level,
        });
        predicted_wait = pred.predicted_wait;
        confidence = pred.confidence;
      } catch {
        predicted_wait = _simpleWait(hour, dayOfWeek, pump.historical_avg_wait || 20);
      }

      return { ...pump, crowd_level, predicted_wait, confidence };
    })
  );

  // Normalize and score
  const maxDist = Math.max(...enriched.map((p) => p.distance), 1);
  const maxWait = Math.max(...enriched.map((p) => p.predicted_wait), 1);

  const scored = enriched.map((pump) => {
    const distScore = 1 - pump.distance / maxDist;
    const waitScore = 1 - pump.predicted_wait / maxWait;
    const ratingScore = (pump.average_rating || 0) / 5;
    const score = 0.3 * distScore + 0.5 * waitScore + 0.2 * ratingScore;

    const crowdLabel =
      pump.crowd_level <= 2 ? 'Low' : pump.crowd_level <= 3 ? 'Medium' : 'High';
    const reason = _buildReason(pump, crowdLabel);

    return { ...pump, score: parseFloat(score.toFixed(4)), crowd_label: crowdLabel, reason };
  });

  const recommendations = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, resultLimit);

  res.json({ success: true, data: recommendations, count: recommendations.length });
};

const _simpleWait = (hour, dayOfWeek, avg) => {
  let m = 1.0;
  if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 19)) m = 1.8;
  else if (hour >= 12 && hour <= 13) m = 1.4;
  if (dayOfWeek >= 1 && dayOfWeek <= 5) m *= 1.1;
  return Math.max(2, Math.round(avg * m));
};

const _buildReason = (pump, crowdLabel) => {
  const parts = [];
  if (pump.distance < 2) parts.push('Very close to you');
  else if (pump.distance < 5) parts.push('Nearby location');
  if (pump.predicted_wait < 10) parts.push('minimal wait time');
  else if (pump.predicted_wait < 20) parts.push('short wait expected');
  if (pump.average_rating >= 4) parts.push('highly rated');
  if (crowdLabel === 'Low') parts.push('low crowd');
  return parts.length > 0 ? parts.join(', ') : 'Good balance of distance & wait time';
};

module.exports = { getRecommendations };
