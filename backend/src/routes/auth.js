const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const { schemas } = require('../middleware/validate');
const passport = require('../config/passport');

router.post('/register', authLimiter, validate(schemas.register), ctrl.register);
router.post('/login', authLimiter, validate(schemas.login), ctrl.login);
router.post('/refresh', ctrl.refreshToken);
router.post('/logout', protect, ctrl.logout);
router.get('/me', protect, ctrl.getMe);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/api/auth/google/failure' }), ctrl.googleCallback);
router.get('/google/failure', (_req, res) => res.status(401).json({ success: false, message: 'Google auth failed' }));

module.exports = router;
