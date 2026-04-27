const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../config/mailer');

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const {
      gender, name, email, phone, password, age, height,
      education, cast, country, city, about, hobbies, interests,
      maritalStatus, motherTongue, sect,
    } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ success: false, message: 'Email already registered' });

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) return res.status(400).json({ success: false, message: 'Phone already registered' });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = await User.create({
      gender, name, email, phone, password, age, height,
      education, cast, country: country || 'Pakistan', city,
      about, hobbies: hobbies || [], interests: interests || [],
      maritalStatus, motherTongue, sect,
      otp, otpExpiry,
    });

    // Send welcome email
    await sendEmail(email, 'welcome', { name });

    // Send OTP
    await sendEmail(email, 'otp', { name, otp });

    const token = generateToken(user._id);

    // HARDCODED TEST USER FOR UI PREVIEW (Bypasses DB)
    if (email === 'test@shadii.pk' && password === 'password123') {
      const token = jwt.sign({ id: 'test_user_id' }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        success: true,
        token,
        user: {
          id: 'test_user_id',
          name: 'Test User',
          email: 'test@shadii.pk',
          gender: 'Male',
          isVerified: true,
          subscription: { type: 'free' }
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Account created! Please verify your phone.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified,
        subscription: user.subscription,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // HARDCODED TEST USER FOR UI PREVIEW (Bypasses DB)
    // Works for both shadi.pk and shadii.pk
    if ((email === 'test@shadii.pk' || email === 'test@shadi.pk') && password === 'password123') {
      const token = jwt.sign({ id: 'test_user_id' }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        success: true,
        token,
        user: {
          id: 'test_user_id',
          name: 'Test User',
          email: email,
          gender: 'Male',
          isVerified: true,
          subscription: { type: 'free' },
          profileCompleteness: 100,
          photos: []
        }
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

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

    user.lastActive = new Date();
    user.isOnline = true;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        isVerified: user.isVerified,
        subscription: user.subscription,
        profileCompleteness: user.profileCompleteness,
        photos: user.photos,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/verify-otp
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

// POST /api/auth/resend-otp
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail(email, 'otp', { name: user.name, otp });

    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpiry');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { isOnline: false, lastActive: new Date() });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
