const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { protect, optionalAuth } = require('../middleware/auth');
const { submitFeedback, getFeedback, voteFeedback } = require('../controllers/feedbackController');

router.post('/', optionalAuth, asyncHandler(submitFeedback));
router.get('/:pumpId', asyncHandler(getFeedback));
router.post('/:id/vote', protect, asyncHandler(voteFeedback));

module.exports = router;
