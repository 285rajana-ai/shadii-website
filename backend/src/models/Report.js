const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reported: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: {
      type: String,
      enum: ['fake_profile', 'harassment', 'inappropriate_content', 'scam', 'spam', 'other'],
      required: true,
    },
    description: { type: String, maxlength: 500 },
    screenshots: [{ type: String }], // cloudinary URLs
    conversationId: { type: String },

    // Admin action
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'action_taken', 'dismissed'],
      default: 'pending',
    },
    adminNote: { type: String },
    actionTaken: {
      type: String,
      enum: ['none', 'warned', 'suspended_24h', 'suspended_7d', 'banned'],
      default: 'none',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
