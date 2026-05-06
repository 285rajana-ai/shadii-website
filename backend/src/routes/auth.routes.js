const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// ─── Public Routes ────────────────────────────────────────────────────────────
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);       // NEW: Refresh access token
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/forgot-password', authController.forgotPassword);  // NEW: Forgot password
router.post('/reset-password', authController.resetPassword);    // NEW: Reset password with OTP

// ─── Protected Routes ─────────────────────────────────────────────────────────
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);
router.post('/logout-all', protect, authController.logoutAll);  // NEW: Logout from all devices
router.post('/fcm-token', protect, authController.updateFcmToken); // NEW: Register FCM token
router.delete('/delete-account', protect, authController.deleteAccount);
router.post('/change-password', protect, authController.changePassword);

module.exports = router;
