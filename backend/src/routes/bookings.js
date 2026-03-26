const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { schemas } = require('../middleware/validate');

router.use(protect);
router.post('/', validate(schemas.createBooking), ctrl.createBooking);
router.get('/', ctrl.getUserBookings);
router.get('/:id', ctrl.getBookingById);
router.put('/:id/cancel', ctrl.cancelBooking);
router.put('/:id/reschedule', ctrl.rescheduleBooking);

module.exports = router;
