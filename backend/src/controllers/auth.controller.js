const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../config/mailer');

// Password validation regex: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Validate password strength
const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!PASSWORD_REGEX.test(password)) {
    return { 
      valid: false, 
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
    };
  }
  return { valid: true };
};

// Sanitize user input to prevent NoSQL injection
const sanitizeInput = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  const sanitized = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    if (key.startsWith('$')) continue; // Skip MongoDB operators
    sanitized[key] = typeof obj[key] === 'string' ? obj[key].trim() : sanitizeInput(obj[key]);
  }
  return sanitized;
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const {
      gender, name, email, phone, password, age, height,
      education, cast, country, city, about, hobbies, interests,
      maritalStatus, motherTongue, sect,
    } = req.body;

    // Validate required fields
    if (!gender || !name || !email || !phone || !password || !age) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: gender, name, email, phone, password, and age are required' 
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ success: false, message: passwordValidation.message });
    }

    // Validate age
    if (age < 18) {
      return res.status(400).json({ success: false, message: 'You must be at least 18 years old to register' });
    }

    // Sanitize inputs
    const sanitizedData = sanitizeInput(req.body);

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

    // Send welcome email
    await sendEmail(email, 'welcome', { name });

    // Send OTP
    await sendEmail(email, 'otp', { name, otp });

    const token = generateToken(user._id);

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
    console.error('Registration error:', err.message);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
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
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
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
