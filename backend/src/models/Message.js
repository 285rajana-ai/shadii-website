const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, index: true }, // `${userId1}_${userId2}` sorted
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'image', 'system'], default: 'text' },

    // Status
    status: {
      type: String,
      enum: ['sent', 'delivered', 'seen'],
      default: 'sent',
    },
    deliveredAt: { type: Date },
    seenAt: { type: Date },

    // For free-tier: "seen" is shown 6 hours after delivery
    seenDelayUntil: { type: Date },

    // Contact info flagging
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String }, // 'phone_number', 'whatsapp', 'social_media'
    flaggedAt: { type: Date },

    // Is this a free message?
    isFreeMessage: { type: Boolean, default: false },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for fast queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });

module.exports = mongoose.model('Message', messageSchema);
