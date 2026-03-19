const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    pump_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pump', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review_text: { type: String, trim: true, maxlength: 1000 },
    helpful_votes: { type: Number, default: 0 },
    unhelpful_votes: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;
