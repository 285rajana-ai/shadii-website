const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketio = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const matchRoutes = require('./routes/match.routes');
const chatRoutes = require('./routes/chat.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const reportRoutes = require('./routes/report.routes');
const adminRoutes = require('./routes/admin.routes');
const notificationRoutes = require('./routes/notification.routes');

const socketHandler = require('./socket/socketHandler');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Connect to Database
connectDB();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.io
socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
