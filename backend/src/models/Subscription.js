const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: {
      type: String,
      enum: ['basic', 'standard', 'premium', 'boost', 'contact_unlock'],
      required: true,
    },
    amount: { type: Number, required: true }, // in PKR
    currency: { type: String, default: 'PKR' },
    duration: { type: Number, required: true }, // days
    // For contact_unlock plan only — the user whose contact is being unlocked
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false },

    // Payment
    paymentMethod: {
      type: String,
      enum: ['google_play', 'easypaisa', 'jazzcash', 'card', 'bank_transfer'],
    },
    paymentStatus: {
      type: String,
      enum: ['awaiting_payment', 'pending', 'verification_submitted', 'completed', 'failed', 'refunded', 'rejected'],
      default: 'awaiting_payment',
    },
    transactionId: { type: String },
    paymentReference: { type: String },
    receiptUrl: { type: String },
    proofSubmittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewNote: { type: String },
    gatewayResponse: { type: mongoose.Schema.Types.Mixed },

    // Auto-renewal
    autoRenew: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Plan configuration
const PLANS = {
  basic: { price: 1000, duration: 30, label: 'Basic — 1 Month' },
  standard: { price: 2500, duration: 90, label: 'Standard — 3 Months' },
  premium: { price: 5000, duration: 180, label: 'Premium — 6 Months' },
  boost: { price: 500, duration: 3, label: 'Profile Boost — 3 Days' },
};

subscriptionSchema.statics.PLANS = PLANS;

module.exports = mongoose.model('Subscription', subscriptionSchema);
