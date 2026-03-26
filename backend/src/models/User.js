const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    googleId: { type: String },
    role: { type: String, enum: ['user', 'admin', 'pump_owner'], default: 'user' },
    refreshTokens: [{ type: String, select: false }],
    fcmToken: { type: String },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    choiceHistory: [
      {
        pumpId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pump' },
        recommendedRank: Number,
        chosenAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
