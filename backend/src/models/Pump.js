const mongoose = require('mongoose');

const pumpSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    phone: { type: String, trim: true },
    capacity: { type: Number, default: 2 }, // number of CNG dispensers
    amenities: {
      washroom: { type: Boolean, default: false },
      shop: { type: Boolean, default: false },
      parking: { type: Boolean, default: false },
      atm: { type: Boolean, default: false },
      restaurant: { type: Boolean, default: false },
    },
    average_rating: { type: Number, default: 0, min: 0, max: 5 },
    total_ratings: { type: Number, default: 0 },
    reviews_count: { type: Number, default: 0 },
    historical_avg_wait: { type: Number, default: 15 }, // minutes
    current_crowd_level: { type: Number, default: 1, min: 1, max: 5 },
    is_active: { type: Boolean, default: true },
    operating_hours: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '22:00' },
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// 2dsphere index for geospatial queries
pumpSchema.index({ latitude: 1, longitude: 1 });

const Pump = mongoose.model('Pump', pumpSchema);
module.exports = Pump;
