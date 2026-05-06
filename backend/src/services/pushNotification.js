/**
 * Push Notification Service — Firebase Cloud Messaging (FCM)
 *
 * Setup:
 *  1. Create a Firebase project at console.firebase.google.com
 *  2. Generate a Service Account JSON key
 *  3. Set FIREBASE_SERVICE_ACCOUNT env var (base64-encoded JSON) OR
 *     set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY separately
 *
 * The service gracefully no-ops when Firebase is not configured (dev environments).
 */

let admin = null;

const initFirebase = () => {
  if (admin) return admin; // Already initialized

  const firebaseAdmin = require('firebase-admin');

  // Check if already initialized
  if (firebaseAdmin.apps.length > 0) {
    admin = firebaseAdmin;
    return admin;
  }

  try {
    let credential;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // Base64-encoded full service account JSON (recommended for Railway/env vars)
      const serviceAccount = JSON.parse(
        Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8')
      );
      credential = firebaseAdmin.credential.cert(serviceAccount);
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // Individual env vars
      credential = firebaseAdmin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      });
    } else {
      console.warn('⚠️  Firebase not configured — push notifications disabled.');
      return null;
    }

    firebaseAdmin.initializeApp({ credential });
    admin = firebaseAdmin;
    console.log('✅ Firebase Admin SDK initialized');
    return admin;
  } catch (err) {
    console.error('❌ Firebase initialization failed:', err.message);
    return null;
  }
};

/**
 * Send a push notification to a single FCM token
 * @param {string} fcmToken - Device FCM token
 * @param {object} payload - { title, body, data }
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
const sendPushNotification = async (fcmToken, { title, body, data = {} }) => {
  if (!fcmToken) return { success: false, error: 'No FCM token provided' };

  const firebaseAdmin = initFirebase();
  if (!firebaseAdmin) return { success: false, error: 'Firebase not configured' };

  try {
    const message = {
      token: fcmToken,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      android: {
        notification: {
          channelId: 'shadii_main',
          priority: 'high',
          sound: 'default',
        },
      },
      apns: {
        payload: { aps: { sound: 'default', badge: 1 } },
      },
    };

    const messageId = await firebaseAdmin.messaging().send(message);
    return { success: true, messageId };
  } catch (err) {
    // Token invalid/expired — caller should clean it up
    if (err.code === 'messaging/registration-token-not-registered') {
      return { success: false, error: 'TOKEN_INVALID', code: 'TOKEN_INVALID' };
    }
    console.error('Push notification error:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send push to multiple tokens (multicast, max 500 per call)
 */
const sendMulticastNotification = async (fcmTokens, { title, body, data = {} }) => {
  if (!fcmTokens || fcmTokens.length === 0) return { success: false, error: 'No tokens provided' };

  const firebaseAdmin = initFirebase();
  if (!firebaseAdmin) return { success: false, error: 'Firebase not configured' };

  const CHUNK_SIZE = 500;
  const results = [];

  for (let i = 0; i < fcmTokens.length; i += CHUNK_SIZE) {
    const chunk = fcmTokens.slice(i, i + CHUNK_SIZE);
    try {
      const message = {
        tokens: chunk,
        notification: { title, body },
        data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
        android: { notification: { channelId: 'shadii_main', priority: 'high', sound: 'default' } },
        apns: { payload: { aps: { sound: 'default' } } },
      };
      const response = await firebaseAdmin.messaging().sendEachForMulticast(message);
      results.push(response);
    } catch (err) {
      console.error('Multicast push error:', err.message);
    }
  }

  return { success: true, results };
};

/**
 * Typed notification senders — convenience wrappers
 */

const notifyNewMessage = async (user, senderName, messagePreview) => {
  if (!user?.fcmToken || !user?.settings?.notifications?.messages) return;
  return sendPushNotification(user.fcmToken, {
    title: `💬 New message from ${senderName}`,
    body: messagePreview || 'Tap to read',
    data: { type: 'message', senderName },
  });
};

const notifyDailyMatches = async (user, matchCount) => {
  if (!user?.fcmToken || !user?.settings?.notifications?.matches) return;
  return sendPushNotification(user.fcmToken, {
    title: `💫 ${matchCount} new matches today!`,
    body: 'Your daily match suggestions are ready. Check them out!',
    data: { type: 'match', matchCount: String(matchCount) },
  });
};

const notifyVerificationApproved = async (user) => {
  if (!user?.fcmToken) return;
  return sendPushNotification(user.fcmToken, {
    title: '✅ Profile Verified!',
    body: 'Your CNIC verification was approved. You now have a blue tick!',
    data: { type: 'verification', status: 'approved' },
  });
};

const notifyVerificationRejected = async (user, reason) => {
  if (!user?.fcmToken) return;
  return sendPushNotification(user.fcmToken, {
    title: '❌ Verification Rejected',
    body: reason || 'Please resubmit your documents.',
    data: { type: 'verification', status: 'rejected' },
  });
};

const notifySubscriptionExpiring = async (user, daysLeft) => {
  if (!user?.fcmToken) return;
  return sendPushNotification(user.fcmToken, {
    title: `⚠️ Premium expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
    body: 'Renew now to keep unlimited messaging and match access.',
    data: { type: 'subscription', daysLeft: String(daysLeft) },
  });
};

const broadcastToAllUsers = async (title, body, data = {}) => {
  const User = require('../models/User');
  const users = await User.find({
    fcmToken: { $exists: true, $ne: null },
    status: 'active',
  }).select('fcmToken').lean();

  const tokens = users.map((u) => u.fcmToken).filter(Boolean);
  if (tokens.length === 0) return { success: false, error: 'No active FCM tokens found' };

  console.log(`📢 Broadcasting push to ${tokens.length} users...`);
  return sendMulticastNotification(tokens, { title, body, data });
};

module.exports = {
  sendPushNotification,
  sendMulticastNotification,
  notifyNewMessage,
  notifyDailyMatches,
  notifyVerificationApproved,
  notifyVerificationRejected,
  notifySubscriptionExpiring,
  broadcastToAllUsers,
};
