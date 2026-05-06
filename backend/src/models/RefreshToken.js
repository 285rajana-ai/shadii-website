const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    // Expires in 30 days from creation
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    // Track device/IP for security
    userAgent: { type: String },
    ipAddress: { type: String },
    isRevoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Fast lookup by token
refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({ user: 1 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
