const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pumpController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { schemas } = require('../middleware/validate');

router.get('/', ctrl.getAllPumps);
router.get('/nearby', ctrl.getNearbyPumps);
router.get('/:id/directions', ctrl.getDirections);
router.get('/:id', ctrl.getPumpById);
router.post('/', protect, authorize('admin', 'pump_owner'), validate(schemas.createPump), ctrl.createPump);
router.put('/:id', protect, authorize('admin', 'pump_owner'), ctrl.updatePump);
router.delete('/:id', protect, authorize('admin'), ctrl.deletePump);

module.exports = router;
