const Message = require('../models/Message');
const User = require('../models/User');

const getConversationId = (id1, id2) => [String(id1), String(id2)].sort().join('_');

async function getChatAccess({ user, otherUserId }) {
  const userId = String(user._id || user.id);
  const conversationId = getConversationId(userId, otherUserId);
  const [sentByMe, sentByOther, otherUser] = await Promise.all([
    Message.countDocuments({ conversationId, sender: userId, receiver: otherUserId, isDeleted: false }),
    Message.countDocuments({ conversationId, sender: otherUserId, receiver: userId, isDeleted: false }),
    User.findById(otherUserId).select('photoViewRequests photoViewApproved'),
  ]);

  const isSubscribed = user.hasActiveSubscription?.() || false;
  const isApproved = user.photoViewApproved?.some((uid) => String(uid) === String(otherUserId)) || false;
  const outgoingRequestPending = otherUser?.photoViewRequests?.some((uid) => String(uid) === userId) || false;
  const incomingRequestPending = user.photoViewRequests?.some((uid) => String(uid) === String(otherUserId)) || false;
  const isFirstOutreach = sentByMe === 0 && sentByOther === 0;
  const isAcceptedReply = isApproved && sentByMe === 0 && sentByOther > 0;
  const canSend = isSubscribed || isFirstOutreach || isAcceptedReply;

  let reason = null;
  if (!canSend) {
    if (incomingRequestPending) reason = 'accept_invite';
    else if (outgoingRequestPending && sentByMe > 0 && sentByOther === 0) reason = 'waiting_for_acceptance';
    else reason = 'subscription_required';
  }

  return {
    conversationId,
    sentByMe,
    sentByOther,
    isSubscribed,
    isApproved,
    incomingRequestPending,
    outgoingRequestPending,
    canSend,
    reason,
    remainingFreeMessages: isSubscribed ? null : canSend ? 1 : 0,
  };
}

async function createIntroRequestIfNeeded({ senderId, receiverId, access }) {
  if (!access || access.sentByMe !== 0 || access.sentByOther !== 0) return;
  const receiver = await User.findById(receiverId);
  if (!receiver) return;
  const alreadyRequested = receiver.photoViewRequests?.some((uid) => String(uid) === String(senderId));
  const alreadyApproved = receiver.photoViewApproved?.some((uid) => String(uid) === String(senderId));
  if (alreadyRequested || alreadyApproved) return;
  receiver.photoViewRequests = receiver.photoViewRequests || [];
  receiver.photoViewRequests.push(senderId);
  await receiver.save();
}

module.exports = {
  getConversationId,
  getChatAccess,
  createIntroRequestIfNeeded,
};
