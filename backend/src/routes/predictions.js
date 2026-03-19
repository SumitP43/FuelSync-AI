const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { getPrediction, getPredictionGraph } = require('../controllers/predictionController');

router.get('/:pumpId', asyncHandler(getPrediction));
router.get('/graph/:pumpId', asyncHandler(getPredictionGraph));

module.exports = router;
