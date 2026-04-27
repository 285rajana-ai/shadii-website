const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    gender: { type: String, enum: ['male', 'female'], required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    age: { type: Number, required: true, min: 18, max: 80 },
    dateOfBirth: { type: Date },

    // Profile Details
    height: { type: String }, // e.g. "5'6\""
    education: {
      type: String,
      enum: ['Matric', 'Intermediate', 'Bachelors', 'Masters', 'PhD', 'Other'],
    },
    cast: { type: String }, // Caste / Community
    country: { type: String, default: 'Pakistan' },
    city: { type: String },
    about: { type: String, maxlength: 500 },
    hobbies: [{ type: String }],
    interests: [{ type: String }],
    maritalStatus: {
      type: String,
      enum: ['Never Married', 'Divorced', 'Widowed'],
      default: 'Never Married',
    },
    motherTongue: { type: String },
    religion: { type: String, default: 'Islam' },
    sect: { type: String },

    // Photos
    photos: [
      {
        url: { type: String },
        blurredUrl: { type: String }, // for females
        publicId: { type: String },
        isMain: { type: Boolean, default: false },
      },
    ],

    // Verification
    isVerified: { type: Boolean, default: false }, // blue tick
    verificationStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none',
    },
    cnicFront: { type: String }, // cloudinary URL
    cnicBack: { type: String },
    livePhoto: { type: String },
    verificationNote: { type: String }, // admin rejection reason

    // Auth
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },

    // Subscription
    subscription: {
      plan: { type: String, enum: ['free', 'basic', 'standard', 'premium'], default: 'free' },
      startDate: { type: Date },
      endDate: { type: Date },
      isActive: { type: Boolean, default: false },
    },

    // Boost
    boost: {
      isActive: { type: Boolean, default: false },
      endDate: { type: Date },
    },

    // Account Status
    status: {
      type: String,
      enum: ['active', 'suspended', 'banned', 'inactive'],
      default: 'active',
    },
    suspendedUntil: { type: Date },
    suspensionReason: { type: String },
    flagCount: { type: Number, default: 0 }, // contact info sharing flags
    warningIssued: { type: Boolean, default: false }, // first offense warning

    // Activity
    lastActive: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false },
    profileCompleteness: { type: Number, default: 0 }, // 0-100%

    // Preferences for matching
    preferences: {
      ageMin: { type: Number, default: 18 },
      ageMax: { type: Number, default: 50 },
      heightMin: { type: String },
      heightMax: { type: String },
      education: [{ type: String }],
      cast: [{ type: String }],
      city: [{ type: String }],
      country: [{ type: String }],
    },

    // Blocked / Reported
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Daily matches sent today
    todayMatchesSentAt: { type: Date },

    // FCM token for push notifications
    fcmToken: { type: String },

    // Profile views
    profileViews: { type: Number, default: 0 },

    // Fake review flag (admin only)
    isFeaturedTestimonial: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Check if subscription is active
userSchema.methods.hasActiveSubscription = function () {
  return (
    this.subscription.isActive &&
    this.subscription.endDate &&
    new Date() < new Date(this.subscription.endDate)
  );
};

// Check if boost is active
userSchema.methods.hasActiveBoost = function () {
  return this.boost.isActive && this.boost.endDate && new Date() < new Date(this.boost.endDate);
};

// Get main profile photo (blurred for females if not subscribed)
userSchema.methods.getProfilePhoto = function (viewerHasSubscription = false) {
  const mainPhoto = this.photos.find((p) => p.isMain) || this.photos[0];
  if (!mainPhoto) return null;

  if (this.gender === 'female' && this.isVerified && !viewerHasSubscription) {
    return mainPhoto.blurredUrl || mainPhoto.url;
  }
  return mainPhoto.url;
};

// Check if account is suspended
userSchema.methods.isSuspended = function () {
  if (this.status === 'suspended' && this.suspendedUntil) {
    if (new Date() < new Date(this.suspendedUntil)) return true;
    // Auto-lift suspension
    this.status = 'active';
    this.suspendedUntil = null;
    this.save();
  }
  return false;
};

// Virtual: isSubscribed
userSchema.virtual('isSubscribed').get(function () {
  return this.hasActiveSubscription();
});

userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
