const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated. Please login.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ success: false, message: 'Account permanently banned. Contact help@shadii.pk' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Middleware to check active subscription
exports.requireSubscription = async (req, res, next) => {
  if (!req.user || !req.user.hasActiveSubscription()) {
    return res.status(403).json({
      success: false,
      message: 'This feature requires a subscription. Upgrade your plan starting from PKR 1,000.',
      upgradeUrl: 'shadii://subscription/plans',
      code: 'SUBSCRIPTION_REQUIRED',
    });
  }
  next();
};

// Admin middleware
exports.isAdmin = async (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// Content and Communication Control middleware
exports.isCACC = async (req, res, next) => {
  if (!req.user || !['cacc', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Content & Communication Control access required' });
  }
  next();
};

// Financial and Subscription Management middleware
exports.isFASM = async (req, res, next) => {
  if (!req.user || !['fasm', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Financial & Subscription Management access required' });
  }
  next();
};

// Super Admin middleware
exports.isSuperAdmin = async (req, res, next) => {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Super Admin access required' });
  }
  next();
};
