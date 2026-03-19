const Feedback = require('../models/Feedback');
const Pump = require('../models/Pump');

/**
 * POST /api/feedback
 */
const submitFeedback = async (req, res) => {
  const { pump_id, rating, review_text } = req.body;
  const user_id = req.user?._id;

  const pump = await Pump.findById(pump_id);
  if (!pump) {
    return res.status(404).json({ success: false, message: 'Pump not found' });
  }

  const feedback = await Feedback.create({
    pump_id,
    user_id,
    rating,
    review_text,
  });

  // Update pump average rating
  const allFeedback = await Feedback.find({ pump_id });
  const avg =
    allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length;
  await Pump.findByIdAndUpdate(pump_id, {
    average_rating: parseFloat(avg.toFixed(1)),
    total_ratings: allFeedback.length,
    reviews_count: allFeedback.length,
  });

  res.status(201).json({ success: true, data: feedback });
};

/**
 * GET /api/feedback/:pumpId
 */
const getFeedback = async (req, res) => {
  const { pumpId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const feedback = await Feedback.find({ pump_id: pumpId })
    .populate('user_id', 'username')
    .sort({ created_at: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean();

  const total = await Feedback.countDocuments({ pump_id: pumpId });
  res.json({ success: true, data: feedback, total, page: parseInt(page) });
};

/**
 * POST /api/feedback/:id/vote
 */
const voteFeedback = async (req, res) => {
  const { id } = req.params;
  const { helpful } = req.body;

  const update = helpful ? { $inc: { helpful_votes: 1 } } : { $inc: { unhelpful_votes: 1 } };
  const feedback = await Feedback.findByIdAndUpdate(id, update, { new: true });

  if (!feedback) {
    return res.status(404).json({ success: false, message: 'Feedback not found' });
  }

  res.json({ success: true, data: feedback });
};

module.exports = { submitFeedback, getFeedback, voteFeedback };
