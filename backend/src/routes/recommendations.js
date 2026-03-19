const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { getRecommendations } = require('../controllers/recommendationController');

router.get('/', asyncHandler(getRecommendations));

module.exports = router;
