/**
 * Shadii.pk Cron Scheduler
 *
 * All scheduled tasks are defined here and initialized from index.js.
 * Uses node-cron (already in package.json).
 *
 * Schedule reference:
 *   ┌────────── minute (0-59)
 *   │ ┌──────── hour (0-23)
 *   │ │ ┌────── day of month (1-31)
 *   │ │ │ ┌──── month (1-12)
 *   │ │ │ │ ┌── day of week (0-7, 0 and 7 = Sunday)
 *   │ │ │ │ │
 *   * * * * *
 */

const cron = require('node-cron');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { generateMatchesForAllUsers } = require('./matchingAlgorithm');
const { notifySubscriptionExpiring, broadcastToAllUsers } = require('./pushNotification');
const { sendEmail } = require('../config/mailer');

let schedulerInitialized = false;

const initScheduler = () => {
  if (schedulerInitialized) {
    console.warn('⚠️  Cron scheduler already initialized — skipping.');
    return;
  }
  schedulerInitialized = true;

  // ─── 1. DAILY MATCH ALGORITHM — Every day at 8:00 AM (PKT = UTC+5) ────────
  // 8 AM PKT = 3:00 AM UTC
  cron.schedule('0 3 * * *', async () => {
    console.log('⏰ [CRON] Daily match algorithm started');
    try {
      await generateMatchesForAllUsers();
    } catch (err) {
      console.error('❌ [CRON] Daily match algorithm failed:', err.message);
    }
  }, { timezone: 'UTC' });

  // ─── 2. SUBSCRIPTION EXPIRY CHECK — Every day at 1:00 AM UTC ─────────────
  cron.schedule('0 1 * * *', async () => {
    console.log('⏰ [CRON] Subscription expiry check started');
    try {
      await checkAndExpireSubscriptions();
    } catch (err) {
      console.error('❌ [CRON] Subscription expiry check failed:', err.message);
    }
  }, { timezone: 'UTC' });

  // ─── 3. BOOST EXPIRY CHECK — Every hour ──────────────────────────────────
  cron.schedule('0 * * * *', async () => {
    try {
      await checkAndExpireBoosts();
    } catch (err) {
      console.error('❌ [CRON] Boost expiry check failed:', err.message);
    }
  }, { timezone: 'UTC' });

  // ─── 4. AUTO-LIFT SUSPENSIONS — Every 30 minutes ─────────────────────────
  cron.schedule('*/30 * * * *', async () => {
    try {
      await liftExpiredSuspensions();
    } catch (err) {
      console.error('❌ [CRON] Suspension lift failed:', err.message);
    }
  }, { timezone: 'UTC' });

  // ─── 5. INACTIVE USER CLEANUP — Every Monday at 2:00 AM UTC ─────────────
  cron.schedule('0 2 * * 1', async () => {
    console.log('⏰ [CRON] Inactive user cleanup started');
    try {
      await cleanupInactiveUsers();
    } catch (err) {
      console.error('❌ [CRON] Inactive user cleanup failed:', err.message);
    }
  }, { timezone: 'UTC' });

  // ─── 6. ONLINE STATUS CLEANUP — Every 15 minutes ─────────────────────────
  // Mark users as offline if last active > 5 minutes ago
  cron.schedule('*/15 * * * *', async () => {
    try {
      const cutoff = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes
      await User.updateMany(
        { isOnline: true, lastActive: { $lt: cutoff } },
        { isOnline: false }
      );
    } catch (err) {
      console.error('❌ [CRON] Online status cleanup failed:', err.message);
    }
  });

  console.log('✅ Cron scheduler initialized with 6 tasks');
};

// ─── Task Implementations ─────────────────────────────────────────────────────

/**
 * Check subscriptions and:
 * 1. Expire those past end date
 * 2. Send expiry reminder at 7 days and 1 day before
 */
const checkAndExpireSubscriptions = async () => {
  const now = new Date();

  // Step 1: Expire overdue subscriptions
  const expiredUsers = await User.find({
    'subscription.isActive': true,
    'subscription.endDate': { $lt: now },
  }).select('_id name email subscription');

  let expired = 0;
  for (const user of expiredUsers) {
    await User.findByIdAndUpdate(user._id, {
      'subscription.isActive': false,
      'subscription.plan': 'free',
    });
    expired++;
    console.log(`📋 Expired subscription for user: ${user.email}`);
  }

  // Also deactivate subscription records
  await Subscription.updateMany(
    { isActive: true, endDate: { $lt: now }, plan: { $ne: 'boost' } },
    { isActive: false }
  );

  // Step 2: Send 7-day expiry warning
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const sixDaysFromNow   = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
  const expiringSoon7 = await User.find({
    'subscription.isActive': true,
    'subscription.endDate': { $gte: sixDaysFromNow, $lte: sevenDaysFromNow },
  }).select('_id name email fcmToken subscription settings');

  for (const user of expiringSoon7) {
    const daysLeft = 7;
    // Push
    await notifySubscriptionExpiring(user, daysLeft);
    // Email
    await sendEmail(user.email, 'subscriptionExpiring', {
      name: user.name,
      daysLeft,
      plan: user.subscription.plan,
    }).catch(() => {});
    console.log(`⚠️  7-day expiry notice sent to: ${user.email}`);
  }

  // Step 3: Send 1-day expiry warning
  const oneDayFromNow  = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  const halfDayFromNow = new Date(now.getTime() + 0.5 * 24 * 60 * 60 * 1000);
  const expiringSoon1 = await User.find({
    'subscription.isActive': true,
    'subscription.endDate': { $gte: halfDayFromNow, $lte: oneDayFromNow },
  }).select('_id name email fcmToken subscription settings');

  for (const user of expiringSoon1) {
    const daysLeft = 1;
    await notifySubscriptionExpiring(user, daysLeft);
    await sendEmail(user.email, 'subscriptionExpiring', {
      name: user.name,
      daysLeft,
      plan: user.subscription.plan,
    }).catch(() => {});
    console.log(`⚠️  1-day expiry notice sent to: ${user.email}`);
  }

  console.log(`✅ Subscription expiry check: ${expired} expired, ${expiringSoon7.length + expiringSoon1.length} warned`);
};

/**
 * Deactivate expired boosts
 */
const checkAndExpireBoosts = async () => {
  const result = await User.updateMany(
    { 'boost.isActive': true, 'boost.endDate': { $lt: new Date() } },
    { 'boost.isActive': false }
  );

  // Also mark subscription records
  await Subscription.updateMany(
    { isActive: true, plan: 'boost', endDate: { $lt: new Date() } },
    { isActive: false }
  );

  if (result.modifiedCount > 0) {
    console.log(`📉 [CRON] Expired ${result.modifiedCount} profile boost(s)`);
  }
};

/**
 * Auto-lift suspensions whose suspendedUntil date has passed
 */
const liftExpiredSuspensions = async () => {
  const result = await User.updateMany(
    { status: 'suspended', suspendedUntil: { $lt: new Date() } },
    { status: 'active', $unset: { suspendedUntil: 1 } }
  );

  if (result.modifiedCount > 0) {
    console.log(`🔓 [CRON] Auto-lifted ${result.modifiedCount} suspension(s)`);
  }
};

/**
 * Clean up stale inactive (soft-deleted) users older than 90 days
 */
const cleanupInactiveUsers = async () => {
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const result = await User.deleteMany({
    status: 'inactive',
    updatedAt: { $lt: cutoff },
  });

  if (result.deletedCount > 0) {
    console.log(`🗑️  [CRON] Purged ${result.deletedCount} inactive user(s) older than 90 days`);
  }
};

module.exports = { initScheduler };
