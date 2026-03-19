const axios = require('axios');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

/**
 * Call the ML service to predict wait time
 */
const predictWaitTime = async ({ hour, day_of_week, historical_avg_wait, crowd_level }) => {
  const { data } = await axios.post(
    `${ML_URL}/predict`,
    { hour, day_of_week, historical_avg_wait, crowd_level },
    { timeout: 5000 }
  );
  return data.prediction;
};

/**
 * Get 24-hour graph data from ML service
 */
const getGraphData = async (pumpId, avgWait, dayOfWeek) => {
  const params = { avg_wait: avgWait };
  if (dayOfWeek !== undefined) params.day_of_week = dayOfWeek;

  const { data } = await axios.get(`${ML_URL}/predict/graph/${pumpId}`, {
    params,
    timeout: 8000,
  });
  return data.graph_data;
};

/**
 * Batch predict for multiple pumps
 */
const batchPredict = async (records) => {
  const { data } = await axios.post(
    `${ML_URL}/predict/batch`,
    { records },
    { timeout: 10000 }
  );
  return data.predictions;
};

module.exports = { predictWaitTime, getGraphData, batchPredict };
