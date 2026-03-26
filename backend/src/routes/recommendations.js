const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/recommendationController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, ctrl.getRecommendations);
router.post('/record-choice', protect, ctrl.recordChoice);

module.exports = router;
