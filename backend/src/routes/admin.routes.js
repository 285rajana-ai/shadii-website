const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User');
const Report = require('../models/Report');
const Subscription = require('../models/Subscription');
const { sendEmail } = require('../config/mailer');

// All admin routes require protect + admin check
// For simplicity, we check isAdmin field on User
const adminCheck = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

router.use(protect, adminCheck);

// GET /api/admin/dashboard — stats
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers, activeUsers, totalFemale, totalMale,
      pendingVerifications, flaggedUsers, totalReports, pendingReports,
      activeSubscriptions, totalRevenue,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active', lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      User.countDocuments({ gender: 'female' }),
      User.countDocuments({ gender: 'male' }),
      User.countDocuments({ verificationStatus: 'pending' }),
      User.countDocuments({ flagCount: { $gt: 0 } }),
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Subscription.countDocuments({ isActive: true }),
      Subscription.aggregate([{ $match: { paymentStatus: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers, activeUsers, totalFemale, totalMale,
        pendingVerifications, flaggedUsers, totalReports, pendingReports,
        activeSubscriptions,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/users — list all users
router.get('/users', async (req, res) => {
  try {
    const { status, gender, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (gender) filter.gender = gender;
    if (search) filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
    ];

    const users = await User.find(filter)
      .select('name email phone gender age city status subscription isVerified flagCount createdAt lastActive')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);
    res.json({ success: true, users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/flagged — flagged users
router.get('/flagged', async (req, res) => {
  try {
    const users = await User.find({ flagCount: { $gt: 0 } })
      .select('name email gender flagCount warningIssued status suspendedUntil suspensionReason')
      .sort({ flagCount: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/verifications — pending CNIC verifications
router.get('/verifications', async (req, res) => {
  try {
    const users = await User.find({ verificationStatus: 'pending' })
      .select('name email gender age city cnicFront cnicBack livePhoto createdAt');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/verify/:userId — approve or reject verification
router.post('/verify/:userId', async (req, res) => {
  try {
    const { action, note } = req.body; // action: 'approve' | 'reject'
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (action === 'approve') {
      user.isVerified = true;
      user.verificationStatus = 'approved';
      await user.save();
      await sendEmail(user.email, 'verificationApproved', { name: user.name });
    } else {
      user.verificationStatus = 'rejected';
      user.verificationNote = note;
      await user.save();
    }

    res.json({ success: true, message: `Verification ${action}d for ${user.name}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/users/:userId/suspend
router.post('/users/:userId/suspend', async (req, res) => {
  try {
    const { hours = 24, reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        status: 'suspended',
        suspendedUntil: new Date(Date.now() + hours * 60 * 60 * 1000),
        suspensionReason: reason,
      },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await sendEmail(user.email, 'suspension', { name: user.name, hours, reason });
    res.json({ success: true, message: `User suspended for ${hours} hours` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/users/:userId/ban
router.post('/users/:userId/ban', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { status: 'banned' }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: `User ${user.name} permanently banned` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/users/:userId/unsuspend
router.post('/users/:userId/unsuspend', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, { status: 'active', $unset: { suspendedUntil: 1 } });
    res.json({ success: true, message: 'User unsuspended' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/subscriptions
router.get('/subscriptions', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const subscriptions = await Subscription.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Subscription.countDocuments();
    res.json({ success: true, subscriptions, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/reports/:reportId/resolve
router.post('/reports/:reportId/resolve', async (req, res) => {
  try {
    const { action } = req.body; // 'resolved' | 'dismissed'
    const Report = require('../models/Report');
    const report = await Report.findByIdAndUpdate(
      req.params.reportId,
      { status: action, resolvedAt: new Date(), resolvedBy: req.user.id },
      { new: true }
    );
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, message: `Report marked as ${action}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/reports
router.get('/reports', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const reports = await Report.find(filter)
      .populate('reporter', 'name email')
      .populate('reported', 'name email gender')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Report.countDocuments(filter);
    res.json({ success: true, reports, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
