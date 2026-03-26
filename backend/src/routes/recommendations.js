const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/recommendationController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, ctrl.getRecommendations);

module.exports = router;
