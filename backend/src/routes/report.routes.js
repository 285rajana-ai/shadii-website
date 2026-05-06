const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth.middleware');
const Report = require('../models/Report');
const User = require('../models/User');
const { sendEmail } = require('../config/mailer');
const multer = require('multer');
const upload = multer({ dest: '/tmp/' });

// POST /api/reports — submit a report
router.post('/', protect, upload.array('screenshots', 5), async (req, res) => {
  try {
    const { reportedUserId, reason, description, conversationId } = req.body;

    if (reportedUserId === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot report yourself' });
    }

    const report = await Report.create({
      reporter: req.user.id,
      reported: reportedUserId,
      reason,
      description,
      conversationId,
    });

    res.status(201).json({ success: true, message: 'Report submitted. Our team will review it within 24 hours.', report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/reports — admin only: get all reports
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};

    const reports = await Report.find(filter)
      .populate('reporter', 'name email gender')
      .populate('reported', 'name email gender flagCount')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Report.countDocuments(filter);
    res.json({ success: true, reports, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/reports/:id/action — admin action on report
router.post('/:id/action', protect, isAdmin, async (req, res) => {
  try {
    const { action, adminNote } = req.body;
    const report = await Report.findById(req.params.id).populate('reported');
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    const reportedUser = report.reported;

    switch (action) {
      case 'warn':
        reportedUser.warningIssued = true;
        reportedUser.flagCount = (reportedUser.flagCount || 0) + 1;
        await reportedUser.save();
        break;
      case 'suspend_24h':
        reportedUser.status = 'suspended';
        reportedUser.suspendedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
        reportedUser.suspensionReason = adminNote || 'Reported by user';
        await reportedUser.save();
        await sendEmail(reportedUser.email, 'suspension', {
          name: reportedUser.name,
          hours: 24,
          reason: adminNote || 'Multiple reports',
        });
        break;
      case 'suspend_7d':
        reportedUser.status = 'suspended';
        reportedUser.suspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        reportedUser.suspensionReason = adminNote || 'Severe violation';
        await reportedUser.save();
        break;
      case 'ban':
        reportedUser.status = 'banned';
        reportedUser.suspensionReason = adminNote || 'Permanently banned';
        await reportedUser.save();
        break;
      case 'dismiss':
        break;
    }

    report.status = action === 'dismiss' ? 'dismissed' : 'action_taken';
    report.actionTaken = action.replace('_', '') === 'suspend24h' ? 'suspended_24h' : action;
    report.adminNote = adminNote;
    report.reviewedAt = new Date();
    await report.save();

    res.json({ success: true, message: `Action "${action}" taken successfully`, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
