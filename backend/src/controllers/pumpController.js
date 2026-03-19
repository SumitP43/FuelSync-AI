const Pump = require('../models/Pump');
const CrowdReport = require('../models/CrowdReport');
const { filterPumpsByRadius } = require('../utils/geolocation');

/**
 * GET /api/pumps/nearby?lat=X&lng=Y&radius=5
 */
const getNearbyPumps = async (req, res) => {
  const { lat, lng, radius = 10 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ success: false, message: 'lat and lng are required' });
  }

  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  const radiusKm = Math.min(parseFloat(radius), 50); // cap at 50 km

  const pumps = await Pump.find({ is_active: true }).lean();
  const nearby = filterPumpsByRadius(pumps, userLat, userLng, radiusKm);

  // Enrich with recent crowd data
  const enriched = await Promise.all(
    nearby.map(async (pump) => {
      const recentReport = await CrowdReport.findOne({ pump_id: pump._id })
        .sort({ timestamp: -1 })
        .lean();
      return {
        ...pump,
        current_crowd_level: recentReport
          ? recentReport.crowd_level
          : pump.current_crowd_level,
      };
    })
  );

  res.json({ success: true, data: enriched, count: enriched.length });
};

/**
 * GET /api/pumps/:id
 */
const getPumpById = async (req, res) => {
  const pump = await Pump.findById(req.params.id).lean();
  if (!pump) {
    return res.status(404).json({ success: false, message: 'Pump not found' });
  }
  res.json({ success: true, data: pump });
};

/**
 * GET /api/pumps
 */
const getAllPumps = async (req, res) => {
  const { city, page = 1, limit = 20 } = req.query;
  const filter = { is_active: true };
  if (city) filter.city = new RegExp(city, 'i');

  const pumps = await Pump.find(filter)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean();
  const total = await Pump.countDocuments(filter);

  res.json({ success: true, data: pumps, total, page: parseInt(page), limit: parseInt(limit) });
};

module.exports = { getNearbyPumps, getPumpById, getAllPumps };
