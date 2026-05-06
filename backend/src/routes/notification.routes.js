const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Message = require('../models/Message');
const Match = require('../models/Match');
const User = require('../models/User');

// GET /api/notifications — aggregate recent activity into notifications
router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const notifications = [];

        // Unread messages → message notifications
        const unreadMsgs = await Message.find({
            receiver: userId,
            status: { $ne: 'seen' },
            isDeleted: false,
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('sender', 'name');

        // Group by sender
        const msgBySender = {};
        for (const msg of unreadMsgs) {
            const sid = String(msg.sender?._id || msg.sender);
            if (!msgBySender[sid]) {
                msgBySender[sid] = { sender: msg.sender, count: 0, latest: msg };
            }
            msgBySender[sid].count += 1;
        }
        for (const entry of Object.values(msgBySender)) {
            notifications.push({
                _id: `msg_${entry.latest._id}`,
                type: 'message',
                title: `${entry.sender?.name || 'Someone'} sent you a message`,
                body: entry.count > 1
                    ? `${entry.count} new messages`
                    : entry.latest.isFlagged ? 'Sent you a message' : entry.latest.content?.substring(0, 80),
                createdAt: entry.latest.createdAt,
                read: false,
            });
        }

        // Today's matches
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const matchDoc = await Match.findOne({ user: userId, generatedAt: { $gte: today } });
        if (matchDoc && matchDoc.matches?.length > 0) {
            notifications.push({
                _id: `match_${matchDoc._id}`,
                type: 'match',
                title: `${matchDoc.matches.length} new matches today! 💫`,
                body: 'Your daily match suggestions are ready. Check them out!',
                createdAt: matchDoc.generatedAt,
                read: matchDoc.matches.every((m) => m.isViewed),
            });
        }

        // Profile verification status
        const me = await User.findById(userId).select('isVerified verificationStatus createdAt');
        if (me?.isVerified) {
            notifications.push({
                _id: `verify_${userId}`,
                type: 'verification',
                title: 'Profile Verified ✅',
                body: 'Your profile is now verified. You have a verified badge.',
                createdAt: me.createdAt,
                read: true,
            });
        }

        // Active subscription
        if (req.user.subscription?.isActive) {
            const endDate = req.user.subscription.endDate;
            const daysLeft = endDate
                ? Math.ceil((new Date(endDate) - Date.now()) / (1000 * 60 * 60 * 24))
                : null;
            if (daysLeft !== null && daysLeft <= 7) {
                notifications.push({
                    _id: `sub_expiry_${userId}`,
                    type: 'subscription',
                    title: 'Premium Expiring Soon ⚠️',
                    body: `Your premium plan expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Renew to keep access.`,
                    createdAt: new Date(),
                    read: false,
                });
            } else {
                notifications.push({
                    _id: `sub_active_${userId}`,
                    type: 'subscription',
                    title: 'Premium Plan Active 👑',
                    body: 'You have full access to all premium features.',
                    createdAt: req.user.subscription.startDate || new Date(),
                    read: true,
                });
            }
        }

        // Sort by date (newest first)
        notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({ success: true, notifications });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/notifications/read-all  ← MUST be before /:id/read to avoid Express matching "read-all" as an id
router.post('/read-all', protect, async (req, res) => {
    try {
        await Message.updateMany(
            { receiver: req.user._id, status: { $ne: 'seen' } },
            { status: 'seen' }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/notifications/:id/read
router.post('/:id/read', protect, async (req, res) => {
    const notifId = req.params.id;
    if (notifId.startsWith('msg_')) {
        const msgId = notifId.replace('msg_', '');
        await Message.findByIdAndUpdate(msgId, { status: 'seen' }).catch(() => { });
    }
    res.json({ success: true });
});

module.exports = router;
