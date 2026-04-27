const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: {
      type: String,
      enum: ['basic', 'standard', 'premium', 'boost'],
      required: true,
    },
    amount: { type: Number, required: true }, // in PKR
    currency: { type: String, default: 'PKR' },
    duration: { type: Number, required: true }, // days
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },

    // Payment
    paymentMethod: {
      type: String,
      enum: ['easypaisa', 'jazzcash', 'card', 'bank_transfer'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: { type: String },
    receiptUrl: { type: String },

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
