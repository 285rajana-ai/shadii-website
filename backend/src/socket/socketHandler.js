const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = (io) => {
  // Store online users: userId -> Set<socketId> so multi-tab sessions stay accurate.
  const onlineUsers = new Map();

  const addOnlineSocket = (userId, socketId) => {
    const sockets = onlineUsers.get(userId) || new Set();
    sockets.add(socketId);
    onlineUsers.set(userId, sockets);
    return sockets.size;
  };

  const removeOnlineSocket = (userId, socketId) => {
    const sockets = onlineUsers.get(userId);
    if (!sockets) return 0;
    sockets.delete(socketId);
    if (sockets.size === 0) {
      onlineUsers.delete(userId);
      return 0;
    }
    return sockets.size;
  };

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id name gender isOnline');
      if (!user) return next(new Error('User not found'));

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const sessionCount = addOnlineSocket(socket.userId, socket.id);

    if (sessionCount === 1) {
      await User.findByIdAndUpdate(socket.userId, { isOnline: true, lastActive: new Date() });
      socket.broadcast.emit('user:online', { userId: socket.userId });
    }

    // Join personal room
    socket.join(socket.userId);

    // Send new message
    socket.on('message:send', async (data) => {
      const { receiverId, content, conversationId, clientMessageId } = data;

      try {
        const Message = require('../models/Message');
        const { scanMessage, handleViolation } = require('../services/chatFilter');
        const { getChatAccess, createIntroRequestIfNeeded } = require('../services/chatAccess');

        // Validate input
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
          return socket.emit('message:error', { error: 'Message content cannot be empty' });
        }

        if (!receiverId || !conversationId) {
          return socket.emit('message:error', { error: 'Invalid receiver or conversation ID' });
        }

        const user = await User.findById(socket.userId);
        if (!user) {
          return socket.emit('message:error', { error: 'User not found' });
        }
        const access = await getChatAccess({ user, otherUserId: receiverId });
        if (!access.canSend) {
          if (access.reason === 'subscription_required') {
            socket.emit('subscription:required', {
              message: 'Your free messages in this chat are used. Subscribe to continue chatting.',
              chatAccess: access,
            });
          } else {
            socket.emit('message:error', {
              error: access.reason === 'accept_invite'
                ? 'Accept this Rishta request before replying.'
                : 'Please wait until your Rishta request is accepted.',
              chatAccess: access,
            });
          }
          return;
        }

        // Check violation
        const { isViolation, label } = scanMessage(content);
        if (isViolation) {
          const result = await handleViolation(socket.userId, label);
          socket.emit('message:flagged', { action: result.action, label });
          return;
        }

        const isFreeMessage = !user.hasActiveSubscription();

        const seenDelayUntil = isFreeMessage ? new Date(Date.now() + 6 * 60 * 60 * 1000) : null;

        const message = await Message.create({
          conversationId,
          sender: socket.userId,
          receiver: receiverId,
          content: content.trim(),
          status: 'delivered',
          deliveredAt: new Date(),
          isFreeMessage,
          seenDelayUntil,
        });
        await createIntroRequestIfNeeded({ senderId: socket.userId, receiverId, access });

        // Send to receiver if online, else send push notification
        const receiverSocketIds = onlineUsers.get(String(receiverId));
        if (receiverSocketIds?.size) {
          receiverSocketIds.forEach((socketId) => {
            io.to(socketId).emit('message:receive', message);
          });
          await Message.findByIdAndUpdate(message._id, { status: 'delivered' });
        } else {
          // Receiver is offline — send push notification
          try {
            const { notifyNewMessage } = require('../services/pushNotification');
            const receiver = await User.findById(receiverId).select('fcmToken name settings');
            if (receiver?.fcmToken) {
              const preview = isFreeMessage ? 'Tap to read' : content.trim().substring(0, 80);
              await notifyNewMessage(receiver, socket.user.name, preview);
            }
          } catch (pushErr) {
            console.error('Push notification error:', pushErr.message);
          }
        }

        // Confirm to sender
        socket.emit('message:sent', {
          ...message.toJSON(),
          isFreeMessage,
          clientMessageId,
          chatAccess: await getChatAccess({ user, otherUserId: receiverId }),
        });
      } catch (err) {
        socket.emit('message:error', { error: err.message });
      }
    });

    // Typing indicator
    socket.on('message:typing', ({ receiverId }) => {
      const receiverSocketIds = onlineUsers.get(String(receiverId));
      if (receiverSocketIds?.size) {
        receiverSocketIds.forEach((socketId) => {
          io.to(socketId).emit('message:typing', { userId: socket.userId });
        });
      }
    });

    // Mark seen
    socket.on('message:seen', async ({ conversationId }) => {
      try {
        const Message = require('../models/Message');
        const user = await User.findById(socket.userId);

        if (user && user.hasActiveSubscription()) {
          await Message.updateMany(
            { conversationId, receiver: socket.userId, status: { $ne: 'seen' } },
            { status: 'seen', seenAt: new Date() }
          );
        }
      } catch (err) {
        console.error('Error marking messages as seen:', err.message);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`🔌 User disconnected: ${socket.userId}`);
      const remainingSessions = removeOnlineSocket(socket.userId, socket.id);
      if (remainingSessions === 0) {
        await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastActive: new Date() });
        socket.broadcast.emit('user:offline', { userId: socket.userId });
      }
    });
  });
};
