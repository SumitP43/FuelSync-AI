const mongoose = require('mongoose');

const pumpSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fuelAvailabilityKg: { type: Number, default: 100 },
    fuelAvailabilityPercent: { type: Number, default: 100, min: 0, max: 100 },
    queueLength: { type: Number, default: 0, min: 0 },
    avgWaitingTimeMin: { type: Number, default: 5, min: 0 },
    status: { type: String, enum: ['open', 'closed', 'maintenance'], default: 'open' },
    operatingHours: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '22:00' },
    },
    capacity: { type: Number, default: 10 },
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    amenities: {
      washroom: { type: Boolean, default: false },
      shop: { type: Boolean, default: false },
      parking: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

pumpSchema.index({ location: '2dsphere' });
pumpSchema.index({ city: 1 });
pumpSchema.index({ status: 1 });

module.exports = mongoose.model('Pump', pumpSchema);
