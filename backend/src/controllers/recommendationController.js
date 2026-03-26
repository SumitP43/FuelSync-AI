const { asyncHandler } = require('../middleware/errorHandler');
const aiService = require('../services/aiRecommendationService');

exports.getRecommendations = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 15, limit = 5 } = req.query;
  if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat and lng required' });

  const result = await aiService.recommend({
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    radius: parseFloat(radius),
    limit: parseInt(limit, 10),
    userId: req.user?._id,
  });

  res.json({ success: true, ...result });
});

/**
 * POST /api/recommendations/record-choice
 * Body: { pumpId, rank }
 * Records which pump the authenticated user selected so the AI can
 * improve future recommendations (self-learning).
 */
exports.recordChoice = asyncHandler(async (req, res) => {
  const { pumpId, rank } = req.body;
  if (!pumpId || !rank) {
    return res.status(400).json({ success: false, message: 'pumpId and rank are required' });
  }
  await aiService.recordChoice(req.user._id, pumpId, rank);
  res.json({ success: true, message: 'Choice recorded' });
});
