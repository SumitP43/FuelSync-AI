const Pump = require('../models/Pump');
const { asyncHandler } = require('../middleware/errorHandler');
const { getRedis } = require('../config/redis');
const mapsService = require('../services/googleMapsService');
const logger = require('../utils/logger');

exports.getNearbyPumps = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 10, page = 1, limit = 20 } = req.query;
  if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng are required' });

  const cacheKey = `nearby:${lat}:${lng}:${radius}:${page}`;
  const redis = getRedis();
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return res.json({ success: true, source: 'cache', ...JSON.parse(cached) });
  }

  const pumps = await Pump.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        distanceField: 'distanceMeters',
        maxDistance: parseFloat(radius) * 1000,
        spherical: true,
        query: { isActive: true },
      },
    },
    { $addFields: { distanceKm: { $divide: ['$distanceMeters', 1000] } } },
    { $skip: (Number(page) - 1) * Number(limit) },
    { $limit: Number(limit) },
  ]);

  // Enrich with real drive distance/duration from Google Distance Matrix when available
  if (mapsService.isAvailable() && pumps.length > 0) {
    const destinations = pumps.map((p) => ({
      lat: p.location.coordinates[1],
      lng: p.location.coordinates[0],
    }));
    const matrix = await mapsService.getDistanceMatrix(
      { lat: parseFloat(lat), lng: parseFloat(lng) },
      destinations
    );
    if (matrix) {
      matrix.forEach((entry, i) => {
        if (entry) {
          pumps[i].driveDistanceKm = entry.distanceKm;
          pumps[i].driveDurationMin = entry.durationMin;
          pumps[i].driveDistanceText = entry.distanceText;
          pumps[i].driveDurationText = entry.durationText;
        }
      });
    }
  }

  const payload = { count: pumps.length, mapsEnriched: mapsService.isAvailable(), pumps };
  if (redis) await redis.setex(cacheKey, 60, JSON.stringify(payload));
  res.json({ success: true, ...payload });
});

exports.getPumpById = asyncHandler(async (req, res) => {
  const pump = await Pump.findById(req.params.id).populate('ownerId', 'name email');
  if (!pump) return res.status(404).json({ success: false, message: 'Pump not found' });
  res.json({ success: true, pump });
});

exports.getAllPumps = asyncHandler(async (req, res) => {
  const { city, status, page = 1, limit = 20 } = req.query;
  const filter = { isActive: true };
  if (city) filter.city = new RegExp(city, 'i');
  if (status) filter.status = status;
  const total = await Pump.countDocuments(filter);
  const pumps = await Pump.find(filter)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));
  res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), pumps });
});

exports.createPump = asyncHandler(async (req, res) => {
  const { latitude, longitude, ...rest } = req.body;
  const pump = await Pump.create({
    ...rest,
    location: { type: 'Point', coordinates: [longitude, latitude] },
    ownerId: req.user._id,
  });
  res.status(201).json({ success: true, pump });
});

exports.updatePump = asyncHandler(async (req, res) => {
  const { latitude, longitude, ...rest } = req.body;
  const update = { ...rest };
  if (latitude !== undefined && longitude !== undefined) {
    update.location = { type: 'Point', coordinates: [longitude, latitude] };
  }
  const pump = await Pump.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!pump) return res.status(404).json({ success: false, message: 'Pump not found' });

  // Invalidate nearby cache using non-blocking SCAN
  const redis = getRedis();
  if (redis) {
    const keys = [];
    let cursor = '0';
    do {
      const [nextCursor, batch] = await redis.scan(cursor, 'MATCH', 'nearby:*', 'COUNT', 100);
      cursor = nextCursor;
      keys.push(...batch);
    } while (cursor !== '0');
    if (keys.length) await redis.del(...keys);
  }

  // Emit real-time update
  const io = req.app.get('io');
  if (io) {
    io.to(`pump:${pump._id}`).emit('fuelUpdated', {
      pumpId: pump._id,
      fuelAvailabilityPercent: pump.fuelAvailabilityPercent,
      queueLength: pump.queueLength,
    });
  }

  res.json({ success: true, pump });
});

exports.deletePump = asyncHandler(async (req, res) => {
  const pump = await Pump.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!pump) return res.status(404).json({ success: false, message: 'Pump not found' });
  res.json({ success: true, message: 'Pump deactivated' });
});

/**
 * GET /api/pumps/:id/directions?lat=...&lng=...
 * Returns Google Maps turn-by-turn directions from the user's location to the pump.
 */
exports.getDirections = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng are required' });

  if (!mapsService.isAvailable()) {
    return res.status(503).json({ success: false, message: 'Google Maps integration is not configured' });
  }

  const pump = await Pump.findById(req.params.id);
  if (!pump) return res.status(404).json({ success: false, message: 'Pump not found' });

  const [pumpLng, pumpLat] = pump.location.coordinates;
  const directions = await mapsService.getDirections(
    { lat: parseFloat(lat), lng: parseFloat(lng) },
    { lat: pumpLat, lng: pumpLng }
  );

  if (!directions) {
    return res.status(502).json({ success: false, message: 'Could not retrieve directions from Google Maps' });
  }

  res.json({ success: true, pump: { id: pump._id, name: pump.name, address: pump.address }, directions });
});
