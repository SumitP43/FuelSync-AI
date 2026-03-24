const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    pump_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pump', required: true },
    hour: { type: Number, required: true, min: 0, max: 23 },
    day_of_week: { type: Number, min: 0, max: 6 },
    predicted_wait: { type: Number, required: true },
    actual_wait: { type: Number },
    confidence: { type: Number, min: 0, max: 1 },
    crowd_status: { type: String, enum: ['low', 'medium', 'high'] },
  },
  { timestamps: { createdAt: 'timestamp', updatedAt: 'updated_at' } }
);

predictionSchema.index({ pump_id: 1, hour: 1 });

const Prediction = mongoose.model('Prediction', predictionSchema);
module.exports = Prediction;
