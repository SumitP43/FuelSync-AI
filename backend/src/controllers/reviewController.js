const Review = require('../models/Review');
const Pump = require('../models/Pump');
const { asyncHandler } = require('../middleware/errorHandler');

exports.createReview = asyncHandler(async (req, res) => {
  const { pumpId, rating, comment } = req.body;
  const pump = await Pump.findById(pumpId);
  if (!pump) return res.status(404).json({ success: false, message: 'Pump not found' });

  const review = await Review.create({ userId: req.user._id, pumpId, rating, comment });

  const stats = await Review.aggregate([
    { $match: { pumpId: pump._id } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length) {
    pump.avgRating = Math.round(stats[0].avg * 10) / 10;
    pump.totalRatings = stats[0].count;
    await pump.save();
  }
  res.status(201).json({ success: true, review });
});

exports.getPumpReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const total = await Review.countDocuments({ pumpId: req.params.pumpId });
  const reviews = await Review.find({ pumpId: req.params.pumpId })
    .populate('userId', 'name')
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));
  res.json({ success: true, total, page: Number(page), reviews });
});

exports.voteReview = asyncHandler(async (req, res) => {
  const { helpful } = req.body;
  const update = helpful ? { $inc: { helpfulVotes: 1 } } : { $inc: { helpfulVotes: -1 } };
  const review = await Review.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  res.json({ success: true, review });
});
