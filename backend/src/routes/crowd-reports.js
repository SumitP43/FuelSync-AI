const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { optionalAuth } = require('../middleware/auth');
const { submitCrowdReport, getCrowdReports } = require('../controllers/crowdReportController');

router.post('/', optionalAuth, asyncHandler(submitCrowdReport));
router.get('/:pumpId', asyncHandler(getCrowdReports));

module.exports = router;
