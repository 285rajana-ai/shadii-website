const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketio = require('socket.io');
require('dotenv').config();

// ─── Fail fast if critical secrets are missing ────────────────────────────────
const REQUIRED_VARS = ['JWT_SECRET', 'MONGO_USERNAME', 'MONGO_PASSWORD'];
const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.error(`[FATAL] Missing required environment variables: ${missing.join(', ')}`);
  console.error('Set these in your Railway/environment configuration before deploying.');
  process.exit(1);
}

// ─── Routes ───────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const matchRoutes = require('./routes/match.routes');
const chatRoutes = require('./routes/chat.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const reportRoutes = require('./routes/report.routes');
const adminRoutes = require('./routes/admin.routes');
const notificationRoutes = require('./routes/notification.routes');

// ─── Services ─────────────────────────────────────────────────────────────────
const socketHandler = require('./socket/socketHandler');
const connectDB = require('./config/db');
const { initScheduler } = require('./services/cronScheduler');

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// ─── Connect to DB ────────────────────────────────────────────────────────────
connectDB();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));

// NOTE: Stripe webhook MUST use raw body — mount BEFORE express.json()
app.use('/api/subscription/webhook/stripe', express.raw({ type: 'application/json' }));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Global: 100 requests per minute per IP
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down.' },
});
app.use('/api', globalLimiter);

// Auth: stricter — 10 login/register attempts per 15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts. Please try again in 15 minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Shadii.pk API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ─── Socket.io ────────────────────────────────────────────────────────────────
app.set('io', io);
socketHandler(io);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Shadii.pk API running on port ${PORT}`);

  // Initialize cron scheduler AFTER server is up
  initScheduler();
});
