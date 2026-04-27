const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = (io) => {
  // Store online users: userId -> socketId
  const onlineUsers = new Map();

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
    console.log(`🔌 User connected: ${socket.userId}`);
    onlineUsers.set(socket.userId, socket.id);

    // Update online status
    await User.findByIdAndUpdate(socket.userId, { isOnline: true, lastActive: new Date() });
    socket.broadcast.emit('user:online', { userId: socket.userId });

    // Join personal room
    socket.join(socket.userId);

    // Send new message
    socket.on('message:send', async (data) => {
      const { receiverId, content, conversationId } = data;

      try {
        const Message = require('../models/Message');
        const { scanMessage, handleViolation } = require('../services/chatFilter');

        // Validate input
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
          return socket.emit('message:error', { error: 'Message content cannot be empty' });
        }

        if (!receiverId || !conversationId) {
          return socket.emit('message:error', { error: 'Invalid receiver or conversation ID' });
        }

        // Check violation
        const { isViolation, label } = scanMessage(content);
        if (isViolation) {
          const result = await handleViolation(socket.userId, label);
          socket.emit('message:flagged', { action: result.action, label });
          return;
        }

        const existingCount = await Message.countDocuments({ conversationId });
        const isFreeMessage = existingCount === 0;

        const user = await User.findById(socket.userId);
        if (!isFreeMessage && !user.hasActiveSubscription()) {
          socket.emit('subscription:required', { message: 'Subscribe to continue messaging' });
          return;
        }

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

        // Send to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message:receive', message);
          // Mark as delivered
          await Message.findByIdAndUpdate(message._id, { status: 'delivered' });
        }

        // Confirm to sender
        socket.emit('message:sent', { ...message.toJSON(), isFreeMessage });
      } catch (err) {
        socket.emit('message:error', { error: err.message });
      }
    });

    // Typing indicator
    socket.on('message:typing', ({ receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message:typing', { userId: socket.userId });
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
      onlineUsers.delete(socket.userId);
      await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastActive: new Date() });
      socket.broadcast.emit('user:offline', { userId: socket.userId });
    });
  });
};
