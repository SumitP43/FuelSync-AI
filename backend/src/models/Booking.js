const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pumpId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pump', required: true },
    slotDate: { type: Date, required: true },
    slotHour: { type: Number, required: true, min: 0, max: 23 },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled', 'expired'],
      default: 'active',
    },
    qrCode: { type: String },
    qrToken: { type: String, default: () => uuidv4() },
    vehicleNumber: { type: String, trim: true },
    notes: { type: String, trim: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

bookingSchema.index({ expiresAt: 1 });
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ pumpId: 1, slotDate: 1, slotHour: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
