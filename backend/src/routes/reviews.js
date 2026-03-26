const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reviewController');
const { protect, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { schemas } = require('../middleware/validate');

router.post('/', protect, validate(schemas.createReview), ctrl.createReview);
router.get('/:pumpId', optionalAuth, ctrl.getPumpReviews);
router.post('/:id/vote', protect, ctrl.voteReview);

module.exports = router;
