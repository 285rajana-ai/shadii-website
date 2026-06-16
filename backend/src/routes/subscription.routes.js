const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { sendEmail } = require('../config/mailer');
const { notifySubscriptionExpiring } = require('../services/pushNotification');
const {
  getGooglePlayPackageName,
  getGooglePlayProductId,
  hasGooglePlayVerificationConfig,
  verifyGooglePlayPurchase,
} = require('../services/googlePlayBilling');
const multer = require('multer');
const fs = require('fs');

const upload = multer({ dest: '/tmp/', limits: { fileSize: 5 * 1024 * 1024 } });
const { uploadImage } = require('../config/cloudinary');
const MANUAL_PAYMENT_METHODS = new Set(['easypaisa', 'bank_transfer']);

const PLANS = {
  basic: { price: 1000, duration: 30, label: 'Basic — 1 Month' },
  standard: { price: 2500, duration: 90, label: 'Standard — 3 Months' },
  premium: { price: 5000, duration: 180, label: 'Premium — 6 Months' },
  boost: { price: 500, duration: 3, label: 'Profile Boost — 3 Days' },
  contact_unlock: { price: 299, duration: 0, label: 'Contact Unlock — PKR 299' },
};

function buildPlanWindow(user, plan) {
  const planConfig = PLANS[plan];
  const now = new Date();

  if (!planConfig || plan === 'contact_unlock') {
    return { startDate: now, endDate: now };
  }

  if (plan === 'boost') {
    const activeBoostEnd = user?.boost?.isActive && user.boost.endDate && new Date(user.boost.endDate) > now
      ? new Date(user.boost.endDate)
      : now;

    return {
      startDate: activeBoostEnd,
      endDate: new Date(activeBoostEnd.getTime() + planConfig.duration * 24 * 60 * 60 * 1000),
    };
  }

  const activeSubscriptionEnd = user?.subscription?.isActive && user.subscription.endDate && new Date(user.subscription.endDate) > now
    ? new Date(user.subscription.endDate)
    : now;

  return {
    startDate: activeSubscriptionEnd,
    endDate: new Date(activeSubscriptionEnd.getTime() + planConfig.duration * 24 * 60 * 60 * 1000),
  };
}

function getPlanFeatures(plan) {
  const base = ['Unlimited browsing', 'Daily match suggestions'];
  const features = {
    basic: [...base, 'Unlimited messaging', 'View contact details'],
    standard: [...base, 'Unlimited messaging', 'View blurred photos', 'See who viewed you', 'Priority in search'],
    premium: [...base, 'Unlimited messaging', 'View all photos', 'Premium badge', 'Top of search results', 'Advanced filters', '1 Free Profile Boost'],
    boost: ['Profile appears at top of search results for 3 days', 'More visibility & profile views'],
  };
  return features[plan] || base;
}

function getBankTransferInstructions(subscription) {
  return {
    method: 'bank_transfer',
    accountTitle: process.env.BANK_TRANSFER_ACCOUNT_TITLE || 'Shadii.pk',
    accountNumber: process.env.BANK_TRANSFER_ACCOUNT_NUMBER || 'Contact support@shadii.pk for account number',
    iban: process.env.BANK_TRANSFER_IBAN || '',
    bankName: process.env.BANK_TRANSFER_BANK_NAME || 'Bank Transfer',
    branchCode: process.env.BANK_TRANSFER_BRANCH_CODE || '',
    reference: subscription._id.toString(),
    supportEmail: process.env.PAYMENT_SUPPORT_EMAIL || 'support@shadii.pk',
  };
}

function getEasyPaisaInstructions(subscription) {
  return {
    method: 'easypaisa',
    accountTitle: process.env.BANK_TRANSFER_ACCOUNT_TITLE || 'Shadii.pk',
    accountNumber: process.env.EASYPAISA_MOBILE_NUMBER || 'Contact support@shadii.pk for EasyPaisa number',
    bankName: 'EasyPaisa',
    reference: subscription._id.toString(),
    supportEmail: process.env.PAYMENT_SUPPORT_EMAIL || 'support@shadii.pk',
  };
}

function getPaymentMethodMeta(paymentMethod) {
  if (paymentMethod === 'google_play') {
    const enabled = hasGooglePlayVerificationConfig();
    return {
      id: paymentMethod,
      enabled,
      requiresManualReview: false,
      message: enabled
        ? 'Secure checkout via Google Play Billing.'
        : 'Google Play Billing is not configured on the server yet.',
    };
  }
  if (paymentMethod === 'bank_transfer') {
    return {
      id: paymentMethod,
      enabled: true,
      requiresManualReview: true,
      message: 'Transfer to our bank account, then upload receipt for verification.',
    };
  }
  if (paymentMethod === 'easypaisa') {
    return {
      id: paymentMethod,
      enabled: true,
      requiresManualReview: true,
      message: 'Send to our EasyPaisa number, then upload receipt for verification.',
    };
  }
  return { id: paymentMethod, enabled: false, requiresManualReview: false, message: 'Not available.' };
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

// ─── GET /api/subscription/payment-methods ───────────────────────────────────
router.get('/payment-methods', protect, (req, res) => {
  res.json({
    success: true,
    methods: ['google_play', 'easypaisa', 'bank_transfer'].map(getPaymentMethodMeta),
  });
});

// ─── POST /api/subscription/initiate ─────────────────────────────────────────
router.post('/initiate', protect, async (req, res) => {
  try {
    const { plan, paymentMethod, targetUserId } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }
    if (!MANUAL_PAYMENT_METHODS.has(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method. Choose EasyPaisa or Bank Transfer.' });
    }

    const planConfig = PLANS[plan];
    const startDate = new Date();
    const endDate = new Date(Date.now() + planConfig.duration * 24 * 60 * 60 * 1000);

    await Subscription.updateMany(
      {
        user: req.user.id,
        isActive: false,
        paymentStatus: { $in: ['awaiting_payment', 'pending', 'verification_submitted'] },
      },
      { paymentStatus: 'failed', reviewNote: 'Replaced by a new payment attempt', reviewedAt: new Date() }
    );

    // Create pending subscription record
    const subscription = await Subscription.create({
      user: req.user.id,
      plan,
      amount: planConfig.price,
      duration: planConfig.duration,
      startDate,
      endDate,
      paymentMethod,
      paymentStatus: 'awaiting_payment',
      isActive: false,
      targetUser: plan === 'contact_unlock' ? targetUserId : undefined,
    });

    const paymentInstructions = paymentMethod === 'easypaisa'
      ? getEasyPaisaInstructions(subscription)
      : getBankTransferInstructions(subscription);

    const methodLabel = paymentMethod === 'easypaisa' ? 'EasyPaisa' : 'Bank Transfer';
    res.json({
      success: true,
      subscriptionId: subscription._id,
      paymentUrl: null,
      paymentStatus: subscription.paymentStatus,
      paymentInstructions,
      amount: planConfig.price,
      plan: planConfig.label,
      message: `${methodLabel} order created for ${planConfig.label}. Send the payment then upload your receipt.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/google-play/verify', protect, async (req, res) => {
  try {
    const {
      plan,
      productId,
      purchaseToken,
      transactionId,
      packageName,
      targetUserId,
      purchase,
    } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected.' });
    }

    if (!hasGooglePlayVerificationConfig()) {
      return res.status(503).json({ success: false, message: 'Google Play Billing is not configured on the server yet.' });
    }

    const expectedProductId = getGooglePlayProductId(plan);
    if (!expectedProductId) {
      return res.status(400).json({ success: false, message: 'No Google Play product is configured for this plan.' });
    }

    if (productId !== expectedProductId) {
      return res.status(400).json({ success: false, message: 'Google Play product does not match the selected plan.' });
    }

    if (!purchaseToken?.trim()) {
      return res.status(400).json({ success: false, message: 'Purchase token is required.' });
    }

    let targetUser = null;
    if (plan === 'contact_unlock') {
      if (!req.user.hasActiveSubscription()) {
        return res.status(403).json({ success: false, message: 'Active subscription required to unlock contacts.' });
      }

      if (!targetUserId) {
        return res.status(400).json({ success: false, message: 'Target user is required for contact unlock.' });
      }

      targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const contactReq = targetUser.contactShareRequests?.find(
        (entry) => entry.fromUser.toString() === req.user._id.toString() && entry.status === 'accepted'
      );

      if (!contactReq) {
        return res.status(400).json({ success: false, message: 'No accepted contact request found for this profile.' });
      }

      if (contactReq.unlockedByRequester) {
        return res.json({ success: true, alreadyUnlocked: true, message: 'Contact is already unlocked.' });
      }
    }

    const purchaseTokenValue = purchaseToken.trim();
    const transactionIdValue = transactionId?.trim() || purchase?.transactionId || purchase?.orderIdAndroid || purchaseTokenValue;

    // Prevent replay attacks globally (check if token was already used by any user)
    const globallyUsed = await Subscription.findOne({
      paymentMethod: 'google_play',
      paymentStatus: 'completed',
      $or: [{ paymentReference: purchaseTokenValue }, { transactionId: transactionIdValue }],
    });

    if (globallyUsed) {
      if (String(globallyUsed.user) === String(req.user.id)) {
        return res.json({
          success: true,
          alreadyProcessed: true,
          subscriptionId: globallyUsed._id,
          paymentStatus: globallyUsed.paymentStatus,
          message: 'Purchase already verified and activated.',
        });
      }
      return res.status(400).json({
        success: false,
        message: 'This purchase token has already been processed by another account.',
      });
    }

    const existing = await Subscription.findOne({
      user: req.user.id,
      paymentMethod: 'google_play',
      $or: [{ paymentReference: purchaseTokenValue }, { transactionId: transactionIdValue }],
    });

    const verification = await verifyGooglePlayPurchase({
      packageName: packageName || getGooglePlayPackageName(),
      productId,
      purchaseToken: purchaseTokenValue,
    });

    if (!verification.valid) {
      return res.status(409).json({ success: false, message: 'Google Play has not marked this purchase as completed yet.' });
    }

    const user = await User.findById(req.user.id).select('name email subscription boost');
    const { startDate, endDate } = buildPlanWindow(user, plan);
    const planConfig = PLANS[plan];
    const subscription = existing || new Subscription();

    subscription.user = req.user.id;
    subscription.targetUser = plan === 'contact_unlock' ? targetUser?._id : undefined;
    subscription.plan = plan;
    subscription.amount = planConfig.price;
    subscription.duration = planConfig.duration;
    subscription.startDate = startDate;
    subscription.endDate = endDate;
    subscription.paymentMethod = 'google_play';
    subscription.paymentStatus = 'pending';
    subscription.isActive = false;
    subscription.paymentReference = purchaseTokenValue;
    subscription.transactionId = transactionIdValue;
    subscription.gatewayResponse = {
      googlePlay: verification.response,
      clientPurchase: purchase || null,
      verifiedAt: new Date().toISOString(),
    };
    await subscription.save();

    await activateSubscription(subscription, transactionIdValue, user, {
      paymentReference: purchaseTokenValue,
      reviewNote: 'Verified by Google Play Billing',
      gatewayResponse: subscription.gatewayResponse,
    });

    res.json({
      success: true,
      subscriptionId: subscription._id,
      paymentStatus: subscription.paymentStatus,
      message: plan === 'contact_unlock'
        ? 'Contact unlock purchased successfully. You can now view the contact details.'
        : 'Google Play purchase verified and your plan is now active.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/subscription/confirm ──────────────────────────────────────────
// Called after successful payment (from client-side or webhook)
router.post('/confirm', protect, async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription || subscription.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    if (subscription.paymentStatus === 'completed') {
      return res.json({ success: true, message: 'Subscription already activated', subscription });
    }

    if (subscription.paymentMethod === 'bank_transfer') {
      return res.status(409).json({
        success: false,
        paymentStatus: subscription.paymentStatus,
        message: 'Bank transfer payments activate only after receipt review.',
      });
    }

    res.json({
      success: true,
      verified: false,
      paymentStatus: subscription.paymentStatus,
      message: 'Payment has not been verified yet. Please complete payment in the gateway and then check status.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/subscription/:subscriptionId/submit-proof ─────────────────────
router.post('/:subscriptionId/submit-proof', protect, upload.single('receipt'), async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.subscriptionId);
    if (!subscription || subscription.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    if (!['bank_transfer', 'easypaisa'].includes(subscription.paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Receipt upload is only available for EasyPaisa and Bank Transfer payments.' });
    }
    if (subscription.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'This subscription has already been activated.' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a payment receipt screenshot.' });
    }
    if (!req.body.paymentReference?.trim()) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Transaction reference is required.' });
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Only JPEG, PNG, and WebP receipts are allowed.' });
    }

    let receiptUrl;
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        const result = await uploadImage(req.file.path, 'receipts');
        receiptUrl = result.secure_url;
      } catch (cloudErr) {
        console.error('Cloudinary receipt upload failed:', cloudErr.message);
        // fallback: small base64 (5MB limit already enforced by multer)
        const buf = fs.readFileSync(req.file.path);
        receiptUrl = `data:${req.file.mimetype};base64,${buf.toString('base64')}`;
      } finally {
        fs.unlinkSync(req.file.path);
      }
    } else {
      const buf = fs.readFileSync(req.file.path);
      receiptUrl = `data:${req.file.mimetype};base64,${buf.toString('base64')}`;
      fs.unlinkSync(req.file.path);
    }

    subscription.receiptUrl = receiptUrl;
    subscription.paymentReference = req.body.paymentReference.trim();
    subscription.transactionId = req.body.paymentReference.trim();
    subscription.reviewNote = req.body.note?.trim() || '';
    subscription.paymentStatus = 'verification_submitted';
    subscription.proofSubmittedAt = new Date();
    subscription.gatewayResponse = {
      source: 'bank_transfer_receipt',
      submittedAt: new Date().toISOString(),
      note: req.body.note?.trim() || '',
    };
    await subscription.save();

    res.json({
      success: true,
      paymentStatus: subscription.paymentStatus,
      message: 'Payment proof submitted. Our team will verify and activate your plan after review.',
    });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
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

// ─── GET /api/subscription/:subscriptionId/status ────────────────────────────
router.get('/:subscriptionId/status', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.subscriptionId)
      .select('plan amount paymentMethod paymentStatus isActive startDate endDate paymentReference reviewNote reviewedAt proofSubmittedAt createdAt');

    if (!subscription || subscription.user?.toString?.() !== req.user.id) {
      const owned = await Subscription.findOne({ _id: req.params.subscriptionId, user: req.user.id })
        .select('plan amount paymentMethod paymentStatus isActive startDate endDate paymentReference reviewNote reviewedAt proofSubmittedAt createdAt');
      if (!owned) {
        return res.status(404).json({ success: false, message: 'Subscription not found' });
      }
      return res.json({ success: true, subscription: owned });
    }

    res.json({ success: true, subscription });
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

async function activateSubscription(subscription, transactionId, user, options = {}) {
  subscription.paymentStatus = 'completed';
  subscription.transactionId = transactionId || subscription.transactionId;
  if (options.paymentReference) {
    subscription.paymentReference = options.paymentReference;
  }
  if (options.reviewNote) {
    subscription.reviewNote = options.reviewNote;
  }
  if (options.gatewayResponse) {
    subscription.gatewayResponse = options.gatewayResponse;
  }
  subscription.reviewedAt = new Date();
  subscription.isActive = true;
  await subscription.save();

  const planConfig = PLANS[subscription.plan];

  if (subscription.plan === 'contact_unlock' && subscription.targetUser) {
    await User.updateOne(
      { _id: subscription.targetUser, 'contactShareRequests.fromUser': subscription.user },
      { $set: { 'contactShareRequests.$.unlockedByRequester': true } }
    );
  } else if (subscription.plan === 'boost') {
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
