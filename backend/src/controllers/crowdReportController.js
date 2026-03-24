const CrowdReport = require('../models/CrowdReport');
const Pump = require('../models/Pump');

/**
 * POST /api/crowd-report
 */
const submitCrowdReport = async (req, res) => {
  const { pump_id, crowd_level, wait_time_reported } = req.body;
  const user_id = req.user?._id;

  const pump = await Pump.findById(pump_id);
  if (!pump) {
    return res.status(404).json({ success: false, message: 'Pump not found' });
  }

  const report = await CrowdReport.create({
    pump_id,
    user_id,
    crowd_level,
    wait_time_reported,
  });

  // Update pump's current crowd level
  await Pump.findByIdAndUpdate(pump_id, { current_crowd_level: crowd_level });

  res.status(201).json({ success: true, data: report });
};

/**
 * GET /api/crowd-report/:pumpId
 */
const getCrowdReports = async (req, res) => {
  const { pumpId } = req.params;
  const reports = await CrowdReport.find({ pump_id: pumpId })
    .sort({ timestamp: -1 })
    .limit(10)
    .lean();
  res.json({ success: true, data: reports });
};

module.exports = { submitCrowdReport, getCrowdReports };
