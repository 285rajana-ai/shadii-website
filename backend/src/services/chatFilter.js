/**
 * Chat Filter Service
 * Detects contact information sharing in messages
 * - Phone numbers (Pakistani and international)
 * - WhatsApp references
 * - Social media handles (Instagram, Facebook, Snapchat, TikTok, etc.)
 * - Email addresses
 */

const CONTACT_PATTERNS = [
  // Pakistani phone numbers
  { pattern: /(\+92|0092|92)?[\s\-.]?0?3[0-9]{2}[\s\-.]?[0-9]{7}/g, type: 'phone_number', label: 'Phone Number' },
  // International phone numbers (generic)
  { pattern: /(\+\d{1,3}[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}/g, type: 'phone_number', label: 'Phone Number' },
  // WhatsApp explicit mention
  { pattern: /whatsapp|whats\s*app|watsapp|wa\.me|wa number/gi, type: 'whatsapp', label: 'WhatsApp' },
  // Email addresses
  { pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, type: 'email', label: 'Email Address' },
  // Instagram
  { pattern: /instagram|insta|ig[\s:@]+[a-zA-Z0-9_.]+/gi, type: 'social_media', label: 'Instagram' },
  // Facebook
  { pattern: /facebook|fb[\s:@]+[a-zA-Z0-9_.]+|fb\.com/gi, type: 'social_media', label: 'Facebook' },
  // Snapchat
  { pattern: /snapchat|snap[\s:@]+[a-zA-Z0-9_.]+/gi, type: 'social_media', label: 'Snapchat' },
  // TikTok
  { pattern: /tiktok|tik tok|@[a-zA-Z0-9_.]{3,}/gi, type: 'social_media', label: 'Social Handle' },
  // Telegram
  { pattern: /telegram|t\.me\/[a-zA-Z0-9_]+/gi, type: 'social_media', label: 'Telegram' },
  // Twitter/X
  { pattern: /twitter|@[a-zA-Z0-9_]{4,15}\b/g, type: 'social_media', label: 'Twitter/X' },
  // Coded attempts: require 3+ consecutive digit-words to reduce false positives on normal Urdu text
  { pattern: /\b(zero|one|two|three|four|five|six|seven|eight|nine|sifar|aik|do|teen|chaar|paanch|chhe|saat|aath|nau)\b[\s,\-]*\b(zero|one|two|three|four|five|six|seven|eight|nine|sifar|aik|do|teen|chaar|paanch|chhe|saat|aath|nau)\b[\s,\-]*\b(zero|one|two|three|four|five|six|seven|eight|nine|sifar|aik|do|teen|chaar|paanch|chhe|saat|aath|nau)\b/gi, type: 'coded_numbers', label: 'Coded Phone Number' },
];

/**
 * Scan a message for contact information
 * @param {string} message
 * @returns {{ isViolation: boolean, type: string|null, label: string|null }}
 */
const scanMessage = (message) => {
  if (!message) return { isViolation: false };

  const cleanMsg = message.toLowerCase().trim();

  for (const { pattern, type, label } of CONTACT_PATTERNS) {
    pattern.lastIndex = 0; // Reset regex state
    if (pattern.test(cleanMsg)) {
      return { isViolation: true, type, label };
    }
  }

  return { isViolation: false, type: null, label: null };
};

/**
 * Handle violation for a user
 * Returns action taken
 */
const handleViolation = async (userId, violationType) => {
  const User = require('../models/User');
  const { sendEmail } = require('../config/mailer');

  const user = await User.findById(userId);
  if (!user) return;

  user.flagCount = (user.flagCount || 0) + 1;

  if (!user.warningIssued) {
    // First offense: issue warning
    user.warningIssued = true;
    await user.save();
    const emailResult = await sendEmail(user.email, 'suspension', {
      name: user.name,
      hours: 0,
      reason: `Attempting to share ${violationType}`,
    });
    return {
      action: 'warning',
      message: 'Warning issued — first offense',
      emailNotified: emailResult?.success === true,
    };
  } else {
    // Second+ offense: suspend for 24 hours
    const suspendedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
    user.status = 'suspended';
    user.suspendedUntil = suspendedUntil;
    user.suspensionReason = `Contact info sharing: ${violationType}`;
    await user.save();
    const emailResult = await sendEmail(user.email, 'suspension', {
      name: user.name,
      hours: 24,
      reason: `Sharing ${violationType}`,
    });
    return {
      action: 'suspended_24h',
      message: 'Account suspended for 24 hours',
      suspendedUntil,
      emailNotified: emailResult?.success === true,
    };
  }
};

module.exports = { scanMessage, handleViolation };
