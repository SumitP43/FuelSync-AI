const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    favorite_pumps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pump' }],
    preferences: {
      max_distance_km: { type: Number, default: 10 },
      preferred_city: { type: String },
      notifications_enabled: { type: Boolean, default: true },
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    is_active: { type: Boolean, default: true },
    last_login: { type: Date },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
