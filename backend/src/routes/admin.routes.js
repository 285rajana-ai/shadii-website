const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User');
const Report = require('../models/Report');
const Subscription = require('../models/Subscription');
const Message = require('../models/Message');
const Match = require('../models/Match');
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
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, activeUsers, totalFemale, totalMale,
      pendingVerifications, flaggedUsers, totalReports, pendingReports,
      activeSubscriptions, totalRevenue, newUsersThisMonth, onlineNow,
      pendingPaymentReviews, totalCompletedPayments, totalMessages,
      activeConversations, matchTotals, activePlanBreakdown,
      paymentMethodBreakdown, reportReasonBreakdown, verificationBreakdown,
      recentUsers, recentReports, recentPayments,
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
      Subscription.countDocuments({ paymentStatus: { $in: ['awaiting_payment', 'pending', 'verification_submitted'] } }),
      Subscription.countDocuments({ paymentStatus: 'completed' }),
      Message.countDocuments({ createdAt: { $gte: fourteenDaysAgo } }),
      Message.aggregate([
        { $group: { _id: '$conversationId' } },
        { $count: 'total' },
      ]),
      Match.aggregate([
        { $project: { matchCount: { $size: { $ifNull: ['$matches', []] } }, likedCount: { $size: { $filter: { input: { $ifNull: ['$matches', []] }, as: 'match', cond: { $eq: ['$$match.isLiked', true] } } } } } },
        { $group: { _id: null, totalMatchSuggestions: { $sum: '$matchCount' }, totalLikedProfiles: { $sum: '$likedCount' } } },
      ]),
      Subscription.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$plan', count: { $sum: 1 }, revenue: { $sum: '$amount' } } },
        { $sort: { count: -1 } },
      ]),
      Subscription.aggregate([
        { $group: { _id: '$paymentMethod', count: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0] } } } },
        { $sort: { count: -1 } },
      ]),
      Report.aggregate([
        { $group: { _id: '$reason', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      User.aggregate([
        { $group: { _id: '$verificationStatus', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      User.find()
        .select('name email city gender createdAt isVerified subscription')
        .sort({ createdAt: -1 })
        .limit(6),
      Report.find()
        .select('reason status createdAt reporter reported')
        .populate('reporter', 'name email')
        .populate('reported', 'name email')
        .sort({ createdAt: -1 })
        .limit(6),
      Subscription.find()
        .select('plan amount paymentMethod paymentStatus createdAt user reviewNote paymentReference')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    const likedPairs = await Match.aggregate([
      { $unwind: '$matches' },
      { $match: { 'matches.isLiked': true, 'matches.matchedUser': { $exists: true, $ne: null } } },
      {
        $project: {
          userId: { $toString: '$user' },
          matchedId: { $toString: '$matches.matchedUser' },
        },
      },
    ]);

    const pairCounter = new Map();
    likedPairs.forEach((pair) => {
      const key = [pair.userId, pair.matchedId].sort().join('__');
      pairCounter.set(key, (pairCounter.get(key) || 0) + 1);
    });
    const mutualConnections = Array.from(pairCounter.values()).filter((count) => count >= 2).length;

    res.json({
      success: true,
      stats: {
        totalUsers, activeUsers, totalFemale, totalMale,
        pendingVerifications, flaggedUsers, totalReports, pendingReports,
        activeSubscriptions,
        totalRevenue: totalRevenue[0]?.total || 0,
        newUsersThisMonth,
        onlineNow,
        pendingPaymentReviews,
        totalCompletedPayments,
        totalMessages,
        activeConversations: activeConversations[0]?.total || 0,
        totalMatchSuggestions: matchTotals[0]?.totalMatchSuggestions || 0,
        totalLikedProfiles: matchTotals[0]?.totalLikedProfiles || 0,
        mutualConnections,
      },
      breakdowns: {
        activePlanBreakdown,
        paymentMethodBreakdown,
        reportReasonBreakdown,
        verificationBreakdown,
      },
      recent: {
        users: recentUsers,
        reports: recentReports,
        payments: recentPayments,
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

    const [
      messageCount,
      sentCount,
      receivedCount,
      reportCount,
      reportsAgainstCount,
      activeConversationIds,
      subHistory,
      recentMessages,
      reportsFiled,
      reportsAgainst,
      matchOverview,
    ] = await Promise.all([
      Message.countDocuments({ $or: [{ sender: user._id }, { receiver: user._id }] }),
      Message.countDocuments({ sender: user._id }),
      Message.countDocuments({ receiver: user._id }),
      Report.countDocuments({ reporter: user._id }),
      Report.countDocuments({ reported: user._id }),
      Message.distinct('conversationId', { $or: [{ sender: user._id }, { receiver: user._id }] }),
      Subscription.find({ user: user._id }).sort({ createdAt: -1 }).limit(5),
      Message.find({ $or: [{ sender: user._id }, { receiver: user._id }] })
        .select('conversationId content status createdAt sender receiver isFlagged flagReason')
        .populate('sender', 'name email')
        .populate('receiver', 'name email')
        .sort({ createdAt: -1 })
        .limit(8),
      Report.find({ reporter: user._id })
        .select('reason status createdAt reported')
        .populate('reported', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
      Report.find({ reported: user._id })
        .select('reason status createdAt reporter')
        .populate('reporter', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
      Match.aggregate([
        { $match: { user: user._id } },
        {
          $project: {
            totalMatches: { $size: { $ifNull: ['$matches', []] } },
            likedMatches: { $size: { $filter: { input: { $ifNull: ['$matches', []] }, as: 'match', cond: { $eq: ['$$match.isLiked', true] } } } },
            viewedMatches: { $size: { $filter: { input: { $ifNull: ['$matches', []] }, as: 'match', cond: { $eq: ['$$match.isViewed', true] } } } },
          },
        },
        {
          $group: {
            _id: null,
            totalMatches: { $sum: '$totalMatches' },
            likedMatches: { $sum: '$likedMatches' },
            viewedMatches: { $sum: '$viewedMatches' },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      user,
      metrics: {
        messageCount,
        sentCount,
        receivedCount,
        reportCount,
        reportsAgainstCount,
        activeConversationCount: activeConversationIds.length,
        totalMatches: matchOverview[0]?.totalMatches || 0,
        likedMatches: matchOverview[0]?.likedMatches || 0,
        viewedMatches: matchOverview[0]?.viewedMatches || 0,
      },
      subHistory,
      recentMessages,
      reportsFiled,
      reportsAgainst,
    });
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
    const { page = 1, limit = 20, plan, status, paymentMethod, search } = req.query;
    const filter = {};
    if (plan) filter.plan = plan;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (status === 'active') filter.isActive = true;
    if (status === 'expired') filter.isActive = false;
    if (status === 'completed') filter.paymentStatus = 'completed';
    if (status === 'pending') filter.paymentStatus = { $in: ['awaiting_payment', 'pending', 'verification_submitted'] };
    if (status === 'rejected') filter.paymentStatus = 'rejected';

    let userIds = null;
    if (search) {
      const matchedUsers = await User.find({
        $or: [
          { name: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') },
          { phone: new RegExp(search, 'i') },
        ],
      }).select('_id');
      userIds = matchedUsers.map((user) => user._id);
      filter.user = { $in: userIds.length ? userIds : [] };
    }

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

// ─── POST /api/admin/subscriptions/:subscriptionId/review ───────────────────
router.post('/subscriptions/:subscriptionId/review', async (req, res) => {
  try {
    const { action, note } = req.body;
    const subscription = await Subscription.findById(req.params.subscriptionId).populate('user', 'name email');
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    if (action === 'approve') {
      if (subscription.paymentStatus === 'completed') {
        return res.json({ success: true, message: 'Subscription already approved', subscription });
      }

      subscription.paymentStatus = 'completed';
      subscription.isActive = true;
      subscription.reviewedAt = new Date();
      subscription.reviewedBy = req.user._id;
      subscription.reviewNote = note || 'Approved by admin';
      if (!subscription.transactionId) {
        subscription.transactionId = subscription.paymentReference || `ADMIN-${Date.now()}`;
      }
      await subscription.save();

      // contact_unlock: mark unlockedByRequester on recipient's contact request
      if (subscription.plan === 'contact_unlock' && subscription.targetUser) {
        await User.findOneAndUpdate(
          { _id: subscription.targetUser, 'contactShareRequests.fromUser': subscription.user._id },
          { $set: { 'contactShareRequests.$.unlockedByRequester': true } }
        );
        // notify requester via socket if available (non-fatal)
        try {
          const io = require('../index').io;
          if (io) {
            io.to(`${subscription.user._id}`).emit('contact:unlocked', {
              targetUserId: subscription.targetUser,
            });
          }
        } catch (_) { }
        return res.json({ success: true, message: 'Contact unlock approved — requester can now view contact details', subscription });
      }

      if (subscription.plan === 'boost') {
        await User.findByIdAndUpdate(subscription.user._id, {
          boost: { isActive: true, endDate: subscription.endDate },
        });
      } else {
        await User.findByIdAndUpdate(subscription.user._id, {
          subscription: {
            plan: subscription.plan,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            isActive: true,
          },
        });
      }

      await sendEmail(subscription.user.email, 'subscriptionConfirm', {
        name: subscription.user.name,
        plan: subscription.plan,
        amount: subscription.amount,
      });

      return res.json({ success: true, message: 'Subscription approved and activated', subscription });
    }

    if (action === 'reject') {
      subscription.paymentStatus = 'rejected';
      subscription.isActive = false;
      subscription.reviewedAt = new Date();
      subscription.reviewedBy = req.user._id;
      subscription.reviewNote = note || 'Payment could not be verified';
      await subscription.save();
      return res.json({ success: true, message: 'Subscription payment rejected', subscription });
    }

    return res.status(400).json({ success: false, message: 'Invalid action. Use "approve" or "reject".' });
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
    const { action, note, actionTaken } = req.body;
    const mappedStatus = action === 'resolved' ? 'reviewed' : action;
    if (!['reviewed', 'dismissed', 'action_taken'].includes(mappedStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid report action' });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.reportId,
      {
        status: mappedStatus,
        adminNote: note || '',
        actionTaken: mappedStatus === 'action_taken' ? (actionTaken || 'warned') : 'none',
        reviewedAt: new Date(),
        reviewedBy: req.user.id,
      },
      { new: true }
    );
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, message: `Report marked as ${mappedStatus}` });
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

    const paymentMethodDistribution = await Subscription.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, revenue: { $sum: '$amount' } } },
      { $sort: { count: -1 } },
    ]);

    const reportReasonDistribution = await Report.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$reason', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const [conversationCount, messageCount, matchSignals] = await Promise.all([
      Message.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$conversationId' } },
        { $count: 'total' },
      ]),
      Message.countDocuments({ createdAt: { $gte: startDate } }),
      Match.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $project: {
            matchCount: { $size: { $ifNull: ['$matches', []] } },
            likedCount: { $size: { $filter: { input: { $ifNull: ['$matches', []] }, as: 'match', cond: { $eq: ['$$match.isLiked', true] } } } },
          },
        },
        {
          $group: {
            _id: null,
            totalMatchSuggestions: { $sum: '$matchCount' },
            totalLikes: { $sum: '$likedCount' },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      userGrowth,
      revenueGrowth,
      planDistribution,
      paymentMethodDistribution,
      reportReasonDistribution,
      relationshipSignals: {
        activeConversations: conversationCount[0]?.total || 0,
        totalMessages: messageCount,
        totalMatchSuggestions: matchSignals[0]?.totalMatchSuggestions || 0,
        totalLikes: matchSignals[0]?.totalLikes || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/admin/photo-requests — monitor user-to-user photo view requests ─
router.get('/photo-requests', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Find users that have pending photo view requests
    const [users, total] = await Promise.all([
      User.find({ 'photoViewRequests.0': { $exists: true } })
        .select('name email gender age city photoViewRequests createdAt')
        .populate('photoViewRequests', 'name email gender age city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments({ 'photoViewRequests.0': { $exists: true } }),
    ]);

    const rows = users.map((u) => ({
      targetUser: { _id: u._id, name: u.name, email: u.email, gender: u.gender, age: u.age, city: u.city },
      requests: (u.photoViewRequests || []).map((r) => ({
        _id: r._id,
        name: r.name,
        email: r.email,
        gender: r.gender,
        age: r.age,
        city: r.city,
      })),
      count: (u.photoViewRequests || []).length,
    }));

    res.json({ success: true, rows, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/admin/contact-unlock-payments — pending contact unlock payments ─
router.get('/contact-unlock-payments', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const [payments, total] = await Promise.all([
      Subscription.find({ plan: 'contact_unlock' })
        .populate('user', 'name email gender city')
        .populate('targetUser', 'name email gender city phone')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Subscription.countDocuments({ plan: 'contact_unlock' }),
    ]);
    res.json({ success: true, payments, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
