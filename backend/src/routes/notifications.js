const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getMyNotifications);
router.put('/read-all', ctrl.markRead);

module.exports = router;
