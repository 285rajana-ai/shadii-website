require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');

const connectDB = require('./src/config/db');
const { generateMatchesForAllUsers } = require('./src/services/matchingAlgorithm');
const socketHandler = require('./src/socket/socketHandler');

// Routes
const authRoutes = require('./src/routes/auth.routes');
const profileRoutes = require('./src/routes/profile.routes');
const chatRoutes = require('./src/routes/chat.routes');
const matchRoutes = require('./src/routes/match.routes');
const subscriptionRoutes = require('./src/routes/subscription.routes');
const reportRoutes = require('./src/routes/report.routes');
const adminRoutes = require('./src/routes/admin.routes');

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
  },
});

// Connect DB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Auth rate limit (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', app: 'Shadii.pk API', version: '1.0.0' });
});

// Socket handler
socketHandler(io);

// Cron Jobs
// Generate daily matches at 8:00 AM
cron.schedule('0 8 * * *', async () => {
  console.log('⏰ 8 AM: Running daily match generation...');
  await generateMatchesForAllUsers();
});

// Check and lift suspensions every hour
cron.schedule('0 * * * *', async () => {
  const User = require('./src/models/User');
  const now = new Date();
  await User.updateMany(
    { status: 'suspended', suspendedUntil: { $lte: now } },
    { status: 'active', $unset: { suspendedUntil: 1 } }
  );
});

// Mark messages as "seen" after 6-hour delay (free tier)
cron.schedule('*/15 * * * *', async () => {
  const Message = require('./src/models/Message');
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  await Message.updateMany(
    {
      status: 'delivered',
      isFreeMessage: true,
      seenDelayUntil: { $lte: new Date() },
    },
    { status: 'seen', seenAt: new Date() }
  );
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🌸 Shadii.pk Server running on port ${PORT}`);
  console.log(`📧 Admin: ${process.env.ADMIN_EMAIL || 'admin@shadii.pk'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

module.exports = { app, io };
