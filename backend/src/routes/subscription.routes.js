const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { sendEmail } = require('../config/mailer');

const PLANS = {
  basic:    { price: 1000, duration: 30,  label: 'Basic — 1 Month' },
  standard: { price: 2500, duration: 90,  label: 'Standard — 3 Months' },
  premium:  { price: 5000, duration: 180, label: 'Premium — 6 Months' },
  boost:    { price: 500,  duration: 3,   label: 'Profile Boost — 3 Days' },
};

// GET /api/subscription/plans
router.get('/plans', (req, res) => {
  res.json({
    success: true,
    plans: Object.entries(PLANS).map(([key, val]) => ({
      id: key,
      ...val,
      features: getPlanFeatures(key),
    })),
  });
});

function getPlanFeatures(plan) {
  const base = ['Unlimited browsing', 'Daily match suggestions'];
  const features = {
    basic: [...base, 'Unlimited messaging', 'View contact details'],
    standard: [...base, 'Unlimited messaging', 'View blurred photos', 'See who viewed you', 'Priority in search'],
    premium: [...base, 'Unlimited messaging', 'View all photos', 'Premium badge', 'Top of search results', 'Advanced filters', 'Profile boost (1 free)'],
    boost: ['Profile appears at top of search results for 3 days', 'More visibility & profile views'],
  };
  return features[plan] || base;
}

// POST /api/subscription/initiate
router.post('/initiate', protect, async (req, res) => {
  try {
    const { plan, paymentMethod } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    const planConfig = PLANS[plan];
    const startDate = new Date();
    const endDate = new Date(Date.now() + planConfig.duration * 24 * 60 * 60 * 1000);

    // Create pending subscription
    const subscription = await Subscription.create({
      user: req.user.id,
      plan,
      amount: planConfig.price,
      duration: planConfig.duration,
      startDate,
      endDate,
      paymentMethod,
      paymentStatus: 'pending',
    });

    // Payment gateway URLs (you'd integrate real SDKs here)
    let paymentUrl;
    switch (paymentMethod) {
      case 'easypaisa':
        paymentUrl = `https://easypay.easypaisa.com.pk/checkout?amount=${planConfig.price}&ref=${subscription._id}`;
        break;
      case 'jazzcash':
        paymentUrl = `https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/?amount=${planConfig.price}&ref=${subscription._id}`;
        break;
      case 'card':
        // Stripe payment intent would go here
        paymentUrl = `/payment/card?subscriptionId=${subscription._id}`;
        break;
      default:
        paymentUrl = null;
    }

    res.json({
      success: true,
      subscription,
      paymentUrl,
      amount: planConfig.price,
      message: `Redirecting to ${paymentMethod} payment...`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/subscription/confirm — called after successful payment
router.post('/confirm', protect, async (req, res) => {
  try {
    const { subscriptionId, transactionId } = req.body;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription || subscription.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    subscription.paymentStatus = 'completed';
    subscription.transactionId = transactionId;
    subscription.isActive = true;
    await subscription.save();

    // Update user subscription
    const planConfig = PLANS[subscription.plan];

    if (subscription.plan === 'boost') {
      // Boost profile
      await User.findByIdAndUpdate(req.user.id, {
        boost: {
          isActive: true,
          endDate: subscription.endDate,
        },
      });
    } else {
      await User.findByIdAndUpdate(req.user.id, {
        subscription: {
          plan: subscription.plan,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          isActive: true,
        },
      });
    }

    // Send confirmation email
    await sendEmail(req.user.email, 'subscriptionConfirm', {
      name: req.user.name,
      plan: planConfig.label,
      amount: planConfig.price,
    });

    res.json({ success: true, message: '🎉 Subscription activated successfully!', subscription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/subscription/my
router.get('/my', protect, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, subscriptions, current: req.user.subscription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
