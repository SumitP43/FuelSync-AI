const mongoose = require('mongoose');

const crowdReportSchema = new mongoose.Schema(
  {
    pump_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pump', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    crowd_level: { type: Number, required: true, min: 1, max: 5 },
    wait_time_reported: { type: Number, min: 0 }, // minutes
    accuracy_votes: { type: Number, default: 0 },
    expires_at: {
      type: Date,
      default: () => new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours TTL
    },
  },
  { timestamps: { createdAt: 'timestamp', updatedAt: 'updated_at' } }
);

crowdReportSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
crowdReportSchema.index({ pump_id: 1, timestamp: -1 });

const CrowdReport = mongoose.model('CrowdReport', crowdReportSchema);
module.exports = CrowdReport;
