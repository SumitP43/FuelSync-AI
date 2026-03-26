const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pumpId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pump', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
    helpfulVotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

reviewSchema.index({ pumpId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, pumpId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
