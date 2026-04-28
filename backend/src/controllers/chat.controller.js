const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const { scanMessage, handleViolation } = require('../services/chatFilter');

// Build conversation ID (always sorted so A-B == B-A)
const getConversationId = (id1, id2) => [id1, id2].sort().join('_');

// GET /api/chat/conversations
exports.getConversations = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Get latest message per conversation
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
          isDeleted: false,
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$receiver', userId] }, { $ne: ['$status', 'seen'] }] }, 1, 0],
            },
          },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
    ]);

    // Populate the other user
    const populated = await Promise.all(
      conversations.map(async (conv) => {
        const lastMsg = conv.lastMessage;
        const otherUserId =
          String(lastMsg.sender) === String(userId) ? lastMsg.receiver : lastMsg.sender;

        const otherUser = await User.findById(otherUserId).select(
          'name photos gender isVerified isOnline lastActive subscription'
        );

        const viewerSubscribed = req.user.hasActiveSubscription();

        return {
          conversationId: conv._id,
          otherUser: otherUser
            ? {
              id: otherUser._id,
              name: otherUser.name,
              isVerified: otherUser.isVerified,
              isOnline: otherUser.isOnline,
              lastActive: otherUser.lastActive,
              photo: otherUser.getProfilePhoto(viewerSubscribed),
              gender: otherUser.gender,
            }
            : null,
          lastMessage: {
            content: lastMsg.isFlagged ? '[Message flagged]' : lastMsg.content,
            status: lastMsg.status,
            createdAt: lastMsg.createdAt,
            isMine: String(lastMsg.sender) === String(userId),
          },
          unreadCount: conv.unreadCount,
        };
      })
    );

    res.json({ success: true, conversations: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/chat/:otherUserId/messages
exports.getMessages = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    const conversationId = getConversationId(userId, otherUserId);

    const messages = await Message.find({ conversationId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Mark messages as delivered
    await Message.updateMany(
      { conversationId, receiver: userId, status: 'sent' },
      { status: 'delivered', deliveredAt: new Date() }
    );

    res.json({ success: true, messages: messages.reverse(), page: Number(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/chat/:otherUserId/send
exports.sendMessage = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    // Check if sender is suspended
    if (req.user.isSuspended()) {
      return res.status(403).json({
        success: false,
        message: `Account suspended until ${req.user.suspendedUntil?.toLocaleString()}`,
        code: 'SUSPENDED',
      });
    }

    const conversationId = getConversationId(userId, otherUserId);

    // Check if this is the first message in this conversation
    const existingCount = await Message.countDocuments({ conversationId });
    const isFreeMessage = existingCount === 0;

    // If not free message, require subscription
    if (!isFreeMessage && !req.user.hasActiveSubscription()) {
      return res.status(403).json({
        success: false,
        message: 'Your free message has been used. Subscribe to continue chatting!',
        code: 'SUBSCRIPTION_REQUIRED',
        upgradeUrl: 'shadii://subscription/plans',
      });
    }

    // Scan message for contact info
    const { isViolation, type, label } = scanMessage(content);

    let message;
    let violationResult;

    if (isViolation) {
      // Handle violation
      violationResult = await handleViolation(userId, label);

      // Still save the message but flag it
      message = await Message.create({
        conversationId,
        sender: userId,
        receiver: otherUserId,
        content, // store original but flag it
        isFlagged: true,
        flagReason: type,
        flaggedAt: new Date(),
        status: 'delivered',
        deliveredAt: new Date(),
        isFreeMessage,
      });

      return res.status(200).json({
        success: false,
        warning: true,
        message: `⚠️ Warning: Sharing ${label} is not allowed on Shadii.pk. ${violationResult.action === 'suspended_24h'
            ? 'Your account has been suspended for 24 hours.'
            : 'Repeated violations will result in suspension.'
          }`,
        action: violationResult.action,
        flaggedMessage: message,
      });
    }

    // Normal message
    const seenDelayUntil = isFreeMessage ? new Date(Date.now() + 6 * 60 * 60 * 1000) : null;

    message = await Message.create({
      conversationId,
      sender: userId,
      receiver: otherUserId,
      content,
      status: 'delivered',
      deliveredAt: new Date(),
      isFreeMessage,
      seenDelayUntil,
    });

    res.status(201).json({
      success: true,
      message,
      isFreeMessage,
      seenNote: isFreeMessage ? 'Seen status will update after 6 hours' : null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/chat/:otherUserId/seen
exports.markSeen = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user.id;
    const conversationId = getConversationId(userId, otherUserId);

    // Only mark as seen if user is subscribed (free users get 6hr delay)
    if (req.user.hasActiveSubscription()) {
      await Message.updateMany(
        { conversationId, receiver: userId, status: { $ne: 'seen' } },
        { status: 'seen', seenAt: new Date() }
      );
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
