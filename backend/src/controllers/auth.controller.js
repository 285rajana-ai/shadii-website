const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../config/mailer');

// Password validation regex: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// ─── Token Generation Helpers ─────────────────────────────────────────────────

const generateAccessToken = (userId) =>
  jwt.sign({ id: userId, type: 'access' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

const generateRefreshTokenValue = () => crypto.randomBytes(64).toString('hex');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!PASSWORD_REGEX.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    };
  }
  return { valid: true };
};

const sanitizeInput = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  const sanitized = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    if (key.startsWith('$')) continue;
    sanitized[key] = typeof obj[key] === 'string' ? obj[key].trim() : sanitizeInput(obj[key]);
  }
  return sanitized;
};

const buildUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  gender: user.gender,
  isAdmin: user.isAdmin,
  isVerified: user.isVerified,
  isEmailVerified: user.isEmailVerified,
  isPhoneVerified: user.isPhoneVerified,
  subscription: user.subscription,
  profileCompleteness: user.profileCompleteness,
  photos: user.photos,
  verificationStatus: user.verificationStatus,
  boost: user.boost,
});

// ─── REGISTER ─────────────────────────────────────────────────────────────────

exports.register = async (req, res) => {
  try {
    const {
      gender, name, email, phone, password, age, height,
      education, cast, country, city, about, hobbies, interests,
      maritalStatus, motherTongue, sect,
    } = req.body;

    if (!gender || !name || !email || !phone || !password || !age) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: gender, name, email, phone, password, and age are required',
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ success: false, message: passwordValidation.message });
    }

    if (age < 18) {
      return res.status(400).json({ success: false, message: 'You must be at least 18 years old to register' });
    }

    const sanitizedData = sanitizeInput(req.body);
    sanitizedData.email = sanitizedData.email?.toLowerCase();
    sanitizedData.phone = String(sanitizedData.phone || '').trim();

    const existingEmail = await User.findOne({ email: sanitizedData.email });
    if (existingEmail) return res.status(400).json({ success: false, message: 'Email already registered' });

    const existingPhone = await User.findOne({ phone: sanitizedData.phone });
    if (existingPhone) return res.status(400).json({ success: false, message: 'Phone already registered' });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = await User.create({
      ...sanitizedData,
      country: sanitizedData.country || 'Pakistan',
      hobbies: sanitizedData.hobbies || [],
      interests: sanitizedData.interests || [],
      otp,
      otpExpiry,
    });

    try {
      await sendEmail(sanitizedData.email, 'otp', { name: user.name, otp }, { throwOnError: true });
    } catch (_) {
      try { await User.findByIdAndDelete(user._id); } catch (e) { console.error('Rollback error:', e.message); }
      return res.status(503).json({
        success: false,
        message: 'We could not send your verification code. Please try registering again.',
      });
    }

    // Welcome email — non-blocking
    sendEmail(sanitizedData.email, 'welcome', { name: user.name });

    const accessToken = generateAccessToken(user._id);
    const refreshTokenValue = generateRefreshTokenValue();
    const REFRESH_DAYS = parseInt(process.env.REFRESH_TOKEN_DAYS || '30');

    await RefreshToken.create({
      user: user._id,
      token: refreshTokenValue,
      expiresAt: new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Account created! Please verify your email.',
      token: accessToken,
      refreshToken: refreshTokenValue,
      user: buildUserPayload(user),
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────

exports.login = async (req, res) => {
  try {
    const { email, password, fcmToken } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !user.password) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (user.status === 'banned') {
      return res.status(403).json({ success: false, message: 'Your account has been permanently banned. Contact help@shadii.pk' });
    }

    if (user.isSuspended()) {
      return res.status(403).json({
        success: false,
        message: `Your account is suspended until ${user.suspendedUntil?.toLocaleString()}. Reason: ${user.suspensionReason}`,
        suspendedUntil: user.suspendedUntil,
      });
    }

    // Update online status and optionally save FCM token
    const updatePayload = { lastActive: new Date(), isOnline: true };
    if (fcmToken) updatePayload.fcmToken = fcmToken;
    await User.findByIdAndUpdate(user._id, updatePayload);

    const accessToken = generateAccessToken(user._id);
    const refreshTokenValue = generateRefreshTokenValue();
    const REFRESH_DAYS = parseInt(process.env.REFRESH_TOKEN_DAYS || '30');

    await RefreshToken.create({
      user: user._id,
      token: refreshTokenValue,
      expiresAt: new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      token: accessToken,
      refreshToken: refreshTokenValue,
      user: buildUserPayload(user),
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token is required' });

    const stored = await RefreshToken.findOne({ token: refreshToken, isRevoked: false });
    if (!stored) return res.status(401).json({ success: false, message: 'Invalid or revoked refresh token' });

    if (new Date() > stored.expiresAt) {
      await RefreshToken.findByIdAndDelete(stored._id);
      return res.status(401).json({ success: false, message: 'Refresh token has expired. Please log in again.' });
    }

    const user = await User.findById(stored.user);
    if (!user || user.status === 'banned') {
      await RefreshToken.findByIdAndDelete(stored._id);
      return res.status(403).json({ success: false, message: 'Account not found or banned.' });
    }

    // Rotate: invalidate old, issue new refresh token
    await RefreshToken.findByIdAndDelete(stored._id);

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshTokenValue = generateRefreshTokenValue();
    const REFRESH_DAYS = parseInt(process.env.REFRESH_TOKEN_DAYS || '30');

    await RefreshToken.create({
      user: user._id,
      token: newRefreshTokenValue,
      expiresAt: new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    res.json({ success: true, token: newAccessToken, refreshToken: newRefreshTokenValue });
  } catch (err) {
    console.error('Refresh token error:', err.message);
    res.status(500).json({ success: false, message: 'Token refresh failed.' });
  }
};

// ─── VERIFY OTP ───────────────────────────────────────────────────────────────

exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.otp !== otp || new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.isPhoneVerified = true;
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Account verified successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── RESEND OTP ───────────────────────────────────────────────────────────────

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail(normalizedEmail, 'otp', { name: user.name, otp }, { throwOnError: true });

    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to resend OTP. Please try again.' });
  }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    // Always return success to prevent email enumeration attacks
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset code has been sent.' });
    }

    const resetOTP = generateOTP();
    user.otp = resetOTP;
    user.otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min for password reset
    await user.save();

    await sendEmail(user.email, 'passwordReset', { name: user.name, otp: resetOTP });

    res.json({ success: true, message: 'If that email exists, a reset code has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to process request.' });
  }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ success: false, message: passwordValidation.message });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'Invalid reset request' });

    if (user.otp !== otp || new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Revoke all existing refresh tokens for security
    await RefreshToken.updateMany({ user: user._id }, { isRevoked: true });

    res.json({ success: true, message: 'Password reset successfully. Please log in again.' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
};

// ─── GET ME ───────────────────────────────────────────────────────────────────

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpiry');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Revoke the specific refresh token if provided
    if (refreshToken) {
      await RefreshToken.findOneAndUpdate({ token: refreshToken }, { isRevoked: true });
    }

    await User.findByIdAndUpdate(req.user.id, { isOnline: false, lastActive: new Date() });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── LOGOUT ALL DEVICES ───────────────────────────────────────────────────────

exports.logoutAll = async (req, res) => {
  try {
    await RefreshToken.updateMany({ user: req.user.id }, { isRevoked: true });
    await User.findByIdAndUpdate(req.user.id, { isOnline: false, lastActive: new Date() });
    res.json({ success: true, message: 'Logged out from all devices' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE FCM TOKEN ─────────────────────────────────────────────────────────

exports.updateFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) return res.status(400).json({ success: false, message: 'FCM token is required' });
    await User.findByIdAndUpdate(req.user.id, { fcmToken });
    res.json({ success: true, message: 'FCM token updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE ACCOUNT ───────────────────────────────────────────────────────────

exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Soft-delete: mark as inactive for admin review
    user.status = 'inactive';
    user.email = `deleted_${Date.now()}_${user.email}`;
    user.phone = `deleted_${Date.now()}_${user.phone}`;
    user.isOnline = false;
    user.fcmToken = undefined;
    await user.save();

    // Revoke all refresh tokens
    await RefreshToken.updateMany({ user: user._id }, { isRevoked: true });

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ success: false, message: passwordValidation.message });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    // Revoke all refresh tokens on other devices for security
    const { refreshToken: currentRT } = req.body;
    if (currentRT) {
      await RefreshToken.updateMany({ user: user._id, token: { $ne: currentRT } }, { isRevoked: true });
    }

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
