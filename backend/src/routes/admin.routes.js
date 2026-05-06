const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User');
const Report = require('../models/Report');
const Subscription = require('../models/Subscription');
const Message = require('../models/Message');
const { sendEmail } = require('../config/mailer');
const {
  notifyVerificationApproved,
  notifyVerificationRejected,
  broadcastToAllUsers,
} = require('../services/pushNotification');

// All admin routes require protect + admin check
const adminCheck = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

router.use(protect, adminCheck);

// ─── GET /api/admin/dashboard — stats ────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, activeUsers, totalFemale, totalMale,
      pendingVerifications, flaggedUsers, totalReports, pendingReports,
      activeSubscriptions, totalRevenue, newUsersThisMonth, onlineNow,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active', lastActive: { $gte: sevenDaysAgo } }),
      User.countDocuments({ gender: 'female' }),
      User.countDocuments({ gender: 'male' }),
      User.countDocuments({ verificationStatus: 'pending' }),
      User.countDocuments({ flagCount: { $gt: 0 } }),
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Subscription.countDocuments({ isActive: true }),
      Subscription.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ isOnline: true }),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers, activeUsers, totalFemale, totalMale,
        pendingVerifications, flaggedUsers, totalReports, pendingReports,
        activeSubscriptions,
        totalRevenue: totalRevenue[0]?.total || 0,
        newUsersThisMonth,
        onlineNow,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/admin/users — list all users with filters ──────────────────────
router.get('/users', async (req, res) => {
  try {
    const { status, gender, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (gender) filter.gender = gender;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('name email phone gender age city status subscription isVerified verificationStatus flagCount createdAt lastActive isOnline')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({ success: true, users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/admin/users/:id — single user detail ───────────────────────────
router.get('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -otp -otpExpiry')
      .populate('blockedUsers', 'name email');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const [messageCount, reportCount, subHistory] = await Promise.all([
      Message.countDocuments({ $or: [{ sender: user._id }, { receiver: user._id }] }),
      Report.countDocuments({ $or: [{ reporter: user._id }, { reported: user._id }] }),
      Subscription.find({ user: user._id }).sort({ createdAt: -1 }).limit(5),
    ]);

    res.json({ success: true, user, messageCount, reportCount, subHistory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/admin/users/:userId — edit user (admin override) ────────────────
router.put('/users/:userId', async (req, res) => {
  try {
    const allowedFields = [
      'name', 'email', 'gender', 'age', 'city', 'country', 'education', 'cast',
      'maritalStatus', 'sect', 'about', 'isAdmin', 'isVerified', 'verificationStatus',
    ];
    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.params.userId, updates, { new: true })
      .select('-password -otp -otpExpiry');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User updated', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/admin/users/:userId — hard delete user ──────────────────────
router.delete('/users/:userId', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    // Cascade: delete messages and reports
    await Promise.all([
      Message.deleteMany({ $or: [{ sender: user._id }, { receiver: user._id }] }),
      Report.deleteMany({ $or: [{ reporter: user._id }, { reported: user._id }] }),
    ]);
    res.json({ success: true, message: `User ${user.name} permanently deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/admin/flagged — users who triggered chat safety filter ──────────
router.get('/flagged', async (req, res) => {
  try {
    const users = await User.find({ flagCount: { $gt: 0 } })
      .select('name email gender flagCount warningIssued status suspendedUntil suspensionReason lastActive createdAt')
      .sort({ flagCount: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/admin/flagged-messages — chat messages flagged by the filter ────
router.get('/flagged-messages', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const [messages, total] = await Promise.all([
      Message.find({ isFlagged: true })
        .populate('sender', 'name email gender flagCount')
        .populate('receiver', 'name email gender')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Message.countDocuments({ isFlagged: true }),
    ]);
    res.json({ success: true, messages, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/admin/verifications — pending CNIC verifications ───────────────
router.get('/verifications', async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const filter = status === 'all' ? {} : { verificationStatus: status };

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('name email gender age city cnicFront cnicBack livePhoto verificationStatus verificationNote createdAt')
        .sort({ createdAt: 1 }) // oldest first — process in order
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({ success: true, users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/admin/verify/:userId — approve or reject verification ──────────
router.post('/verify/:userId', async (req, res) => {
  try {
    const { action, note } = req.body; // action: 'approve' | 'reject'
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (action === 'approve') {
      user.isVerified = true;
      user.verificationStatus = 'approved';
      user.verificationNote = undefined;
      await user.save();
      // Email + Push notification
      await sendEmail(user.email, 'verificationApproved', { name: user.name });
      await notifyVerificationApproved(user);
    } else if (action === 'reject') {
      user.verificationStatus = 'rejected';
      user.verificationNote = note || 'Documents could not be verified';
      await user.save();
      // Push notification
      await notifyVerificationRejected(user, note);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action. Use "approve" or "reject"' });
    }

    res.json({ success: true, message: `Verification ${action}d for ${user.name}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/admin/users/:userId/suspend ───────────────────────────────────
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

// ─── POST /api/admin/users/:userId/ban ───────────────────────────────────────
router.post('/users/:userId/ban', async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { status: 'banned', suspensionReason: reason || 'Permanently banned by admin' },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: `User ${user.name} permanently banned` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/admin/users/:userId/unsuspend ─────────────────────────────────
router.post('/users/:userId/unsuspend', async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.params.userId,
      { status: 'active', $unset: { suspendedUntil: 1, suspensionReason: 1 } }
    );
    res.json({ success: true, message: 'User unsuspended' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/admin/subscriptions ────────────────────────────────────────────
router.get('/subscriptions', async (req, res) => {
  try {
    const { page = 1, limit = 20, plan, status } = req.query;
    const filter = {};
    if (plan) filter.plan = plan;
    if (status === 'active') filter.isActive = true;
    if (status === 'expired') filter.isActive = false;
    if (status === 'completed') filter.paymentStatus = 'completed';

    const [subscriptions, total] = await Promise.all([
      Subscription.find(filter)
        .populate('user', 'name email gender')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Subscription.countDocuments(filter),
    ]);
    res.json({ success: true, subscriptions, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/admin/reports ───────────────────────────────────────────────────
router.get('/reports', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('reporter', 'name email')
        .populate('reported', 'name email gender flagCount')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Report.countDocuments(filter),
    ]);
    res.json({ success: true, reports, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/admin/reports/:reportId/resolve ────────────────────────────────
router.post('/reports/:reportId/resolve', async (req, res) => {
  try {
    const { action } = req.body; // 'resolved' | 'dismissed'
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

// ─── POST /api/admin/broadcast — send push notification to all users ──────────
router.post('/broadcast', async (req, res) => {
  try {
    const { title, body, data } = req.body;
    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Title and body are required' });
    }

    console.log(`📢 Admin broadcast initiated by ${req.user.email}: "${title}"`);
    const result = await broadcastToAllUsers(title, body, data || {});

    res.json({
      success: true,
      message: 'Broadcast sent',
      result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/admin/analytics — revenue & growth chart data ──────────────────
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Daily user registrations
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Daily revenue
    const revenueGrowth = await Subscription.aggregate([
      { $match: { paymentStatus: 'completed', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Plan distribution
    const planDistribution = await Subscription.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$plan', count: { $sum: 1 } } },
    ]);

    res.json({ success: true, userGrowth, revenueGrowth, planDistribution });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
