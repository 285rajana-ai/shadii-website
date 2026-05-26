const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const morgan = require('morgan');

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
app.set('trust proxy', 1); // Trust the first proxy (Railway load balancer)
const server = http.createServer(app);

// Socket.IO with secure configuration
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});


// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - API wide
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Auth rate limit (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
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
  res.json({ 
    status: 'OK', 
    app: 'Shadii.pk API', 
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.method} ${req.path} not found` 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
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
  console.log('✅ Auto-lifted expired suspensions');
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
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

module.exports = { app, io };
