const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { getNearbyPumps, getPumpById, getAllPumps } = require('../controllers/pumpController');

router.get('/', asyncHandler(getAllPumps));
router.get('/nearby', asyncHandler(getNearbyPumps));
router.get('/:id', asyncHandler(getPumpById));

module.exports = router;
