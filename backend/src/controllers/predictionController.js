const Pump = require('../models/Pump');
const Prediction = require('../models/Prediction');
const mlClient = require('../utils/mlClient');

/**
 * GET /api/predictions/:pumpId?hour=H
 */
const getPrediction = async (req, res) => {
  const { pumpId } = req.params;
  const hour = req.query.hour !== undefined ? parseInt(req.query.hour) : new Date().getHours();
  const dayOfWeek = req.query.day_of_week !== undefined
    ? parseInt(req.query.day_of_week)
    : new Date().getDay();

  const pump = await Pump.findById(pumpId).lean();
  if (!pump) {
    return res.status(404).json({ success: false, message: 'Pump not found' });
  }

  // Try ML service, fallback to simple heuristic
  let prediction;
  try {
    prediction = await mlClient.predictWaitTime({
      hour,
      day_of_week: dayOfWeek,
      historical_avg_wait: pump.historical_avg_wait || 20,
      crowd_level: pump.current_crowd_level || 2,
    });
  } catch {
    prediction = _heuristicPrediction(hour, dayOfWeek, pump.historical_avg_wait || 20);
  }

  res.json({ success: true, pump_id: pumpId, hour, prediction });
};

/**
 * GET /api/prediction-graph/:pumpId
 */
const getPredictionGraph = async (req, res) => {
  const { pumpId } = req.params;

  const pump = await Pump.findById(pumpId).lean();
  if (!pump) {
    return res.status(404).json({ success: false, message: 'Pump not found' });
  }

  let graphData;
  try {
    graphData = await mlClient.getGraphData(pumpId, pump.historical_avg_wait || 20);
  } catch {
    graphData = _generateHeuristicGraph(pump.historical_avg_wait || 20);
  }

  res.json({ success: true, pump_id: pumpId, pump_name: pump.name, graph_data: graphData });
};

// --- Fallback heuristics (no ML service) ---

const _heuristicPrediction = (hour, dayOfWeek, avgWait) => {
  let multiplier = 1.0;
  if (hour >= 6 && hour <= 9) multiplier = 1.8;
  else if (hour >= 17 && hour <= 19) multiplier = 2.0;
  else if (hour >= 12 && hour <= 13) multiplier = 1.4;
  if (dayOfWeek >= 1 && dayOfWeek <= 5) multiplier *= 1.1;

  const predicted_wait = Math.max(2, Math.round(avgWait * multiplier));
  const crowd_level = predicted_wait < 15 ? 1 : predicted_wait < 30 ? 3 : 5;
  const crowd_status = crowd_level <= 2 ? 'low' : crowd_level <= 3 ? 'medium' : 'high';
  return { predicted_wait, confidence: 0.70, crowd_status };
};

const _generateHeuristicGraph = (avgWait) => {
  return Array.from({ length: 24 }, (_, hour) => {
    const pred = _heuristicPrediction(hour, new Date().getDay(), avgWait);
    return { ...pred, hour, label: `${String(hour).padStart(2, '0')}:00` };
  });
};

module.exports = { getPrediction, getPredictionGraph };
