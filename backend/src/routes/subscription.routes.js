const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { sendEmail } = require('../config/mailer');
const { notifySubscriptionExpiring } = require('../services/pushNotification');

const PLANS = {
  basic:    { price: 1000, duration: 30,  label: 'Basic — 1 Month' },
  standard: { price: 2500, duration: 90,  label: 'Standard — 3 Months' },
  premium:  { price: 5000, duration: 180, label: 'Premium — 6 Months' },
  boost:    { price: 500,  duration: 3,   label: 'Profile Boost — 3 Days' },
};

function getPlanFeatures(plan) {
  const base = ['Unlimited browsing', 'Daily match suggestions'];
  const features = {
    basic:    [...base, 'Unlimited messaging', 'View contact details'],
    standard: [...base, 'Unlimited messaging', 'View blurred photos', 'See who viewed you', 'Priority in search'],
    premium:  [...base, 'Unlimited messaging', 'View all photos', 'Premium badge', 'Top of search results', 'Advanced filters', '1 Free Profile Boost'],
    boost:    ['Profile appears at top of search results for 3 days', 'More visibility & profile views'],
  };
  return features[plan] || base;
}

// ─── GET /api/subscription/plans ─────────────────────────────────────────────
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

// ─── POST /api/subscription/initiate ─────────────────────────────────────────
router.post('/initiate', protect, async (req, res) => {
  try {
    const { plan, paymentMethod } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    const planConfig = PLANS[plan];
    const startDate = new Date();
    const endDate = new Date(Date.now() + planConfig.duration * 24 * 60 * 60 * 1000);

    // Create pending subscription record
    const subscription = await Subscription.create({
      user: req.user.id,
      plan,
      amount: planConfig.price,
      duration: planConfig.duration,
      startDate,
      endDate,
      paymentMethod,
      paymentStatus: 'pending',
      isActive: false,
    });

    // Build payment gateway URL
    let paymentUrl;
    switch (paymentMethod) {
      case 'easypaisa':
        paymentUrl = `https://easypay.easypaisa.com.pk/checkout?amount=${planConfig.price}&ref=${subscription._id}&merchantId=${process.env.EASYPAISA_MERCHANT_ID || 'DEMO'}`;
        break;
      case 'jazzcash':
        paymentUrl = `https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/?amount=${planConfig.price}&ref=${subscription._id}&merchantId=${process.env.JAZZCASH_MERCHANT_ID || 'DEMO'}`;
        break;
      case 'card':
        // In production: create a Stripe PaymentIntent and return the clientSecret
        paymentUrl = `/payment/card?subscriptionId=${subscription._id}&amount=${planConfig.price}`;
        break;
      case 'bank_transfer':
        paymentUrl = null; // Manual review
        break;
      default:
        paymentUrl = null;
    }

    res.json({
      success: true,
      subscriptionId: subscription._id,
      paymentUrl,
      amount: planConfig.price,
      plan: planConfig.label,
      message: `Payment initiated for ${planConfig.label}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/subscription/confirm ──────────────────────────────────────────
// Called after successful payment (from client-side or webhook)
router.post('/confirm', protect, async (req, res) => {
  try {
    const { subscriptionId, transactionId } = req.body;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription || subscription.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    if (subscription.paymentStatus === 'completed') {
      return res.json({ success: true, message: 'Subscription already activated', subscription });
    }

    await activateSubscription(subscription, transactionId, req.user);

    res.json({ success: true, message: '🎉 Subscription activated successfully!', subscription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/subscription/webhook/easypaisa ────────────────────────────────
// EasyPaisa IPN (Instant Payment Notification) webhook
router.post('/webhook/easypaisa', async (req, res) => {
  try {
    const { transactionId, orderId, status, amount, storeId } = req.body;

    // Verify merchant store ID
    if (process.env.EASYPAISA_MERCHANT_ID && storeId !== process.env.EASYPAISA_MERCHANT_ID) {
      console.warn('⚠️  EasyPaisa webhook: invalid merchant store ID');
      return res.status(400).json({ success: false, message: 'Invalid merchant' });
    }

    console.log(`💳 EasyPaisa IPN received: orderId=${orderId}, status=${status}, amount=${amount}`);

    if (status === 'PAID') {
      const subscription = await Subscription.findById(orderId);
      if (!subscription) {
        console.error('EasyPaisa webhook: subscription not found for orderId:', orderId);
        return res.status(200).json({ message: 'OK' }); // Always 200 to stop retries
      }

      if (subscription.paymentStatus !== 'completed') {
        const user = await User.findById(subscription.user);
        await activateSubscription(subscription, transactionId, user);
        console.log(`✅ EasyPaisa: Subscription ${orderId} activated via webhook`);
      }
    }

    res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error('EasyPaisa webhook error:', err.message);
    res.status(200).json({ message: 'OK' }); // Always 200 to prevent retries
  }
});

// ─── POST /api/subscription/webhook/jazzcash ─────────────────────────────────
// JazzCash IPN webhook
router.post('/webhook/jazzcash', async (req, res) => {
  try {
    const { pp_TxnRefNo, pp_BillReference, pp_ResponseCode, pp_Amount } = req.body;

    console.log(`💳 JazzCash IPN received: ref=${pp_BillReference}, response=${pp_ResponseCode}`);

    // pp_ResponseCode '000' = success
    if (pp_ResponseCode === '000') {
      const subscription = await Subscription.findById(pp_BillReference);
      if (subscription && subscription.paymentStatus !== 'completed') {
        const user = await User.findById(subscription.user);
        await activateSubscription(subscription, pp_TxnRefNo, user);
        console.log(`✅ JazzCash: Subscription ${pp_BillReference} activated via webhook`);
      }
    }

    res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error('JazzCash webhook error:', err.message);
    res.status(200).json({ message: 'OK' });
  }
});

// ─── POST /api/subscription/webhook/stripe ────────────────────────────────────
// Stripe webhook for card payments
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Stripe webhook signature failed:', err.message);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const subscriptionId = paymentIntent.metadata?.subscriptionId;
      if (subscriptionId) {
        const subscription = await Subscription.findById(subscriptionId);
        if (subscription && subscription.paymentStatus !== 'completed') {
          const user = await User.findById(subscription.user);
          await activateSubscription(subscription, paymentIntent.id, user);
          console.log(`✅ Stripe: Subscription ${subscriptionId} activated via webhook`);
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Stripe webhook error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/subscription/my ─────────────────────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id }).sort({ createdAt: -1 });
    const user = await User.findById(req.user.id).select('subscription boost');

    // Check if subscription has expired and auto-deactivate
    const currentSub = user?.subscription;
    if (currentSub?.isActive && currentSub?.endDate && new Date() > new Date(currentSub.endDate)) {
      await User.findByIdAndUpdate(req.user.id, {
        'subscription.isActive': false,
        'subscription.plan': 'free',
      });
      currentSub.isActive = false;
      currentSub.plan = 'free';
    }

    res.json({ success: true, subscriptions, current: currentSub, boost: user?.boost });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/subscription/cancel ───────────────────────────────────────────
router.post('/cancel', protect, async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription || subscription.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    // Mark as non-auto-renewing (subscription stays active until end date)
    subscription.autoRenew = false;
    await subscription.save();

    res.json({
      success: true,
      message: 'Auto-renewal disabled. Your plan remains active until the expiry date.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Helper: activateSubscription ────────────────────────────────────────────

async function activateSubscription(subscription, transactionId, user) {
  subscription.paymentStatus = 'completed';
  subscription.transactionId = transactionId;
  subscription.isActive = true;
  await subscription.save();

  const planConfig = PLANS[subscription.plan];

  if (subscription.plan === 'boost') {
    await User.findByIdAndUpdate(subscription.user, {
      boost: { isActive: true, endDate: subscription.endDate },
    });
  } else {
    await User.findByIdAndUpdate(subscription.user, {
      subscription: {
        plan: subscription.plan,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        isActive: true,
      },
    });
  }

  // Send confirmation email
  if (user?.email) {
    await sendEmail(user.email, 'subscriptionConfirm', {
      name: user.name,
      plan: planConfig.label,
      amount: planConfig.price,
    });
  }
}

module.exports = router;
