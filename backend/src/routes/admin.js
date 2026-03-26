const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/dashboard', ctrl.getDashboard);
router.get('/peak-hours', ctrl.getPeakHours);
router.get('/pump-performance', ctrl.getPumpPerformance);
router.get('/analytics', ctrl.getAnalyticsReport);
router.get('/users', ctrl.getAllUsers);

module.exports = router;
