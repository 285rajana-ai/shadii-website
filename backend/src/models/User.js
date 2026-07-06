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
    },
    cast: { type: String }, // Caste / Community
    country: { type: String, default: 'Pakistan' },
    region: { type: String },
    city: { type: String },
    about: { type: String, maxlength: 500 },
    hobbies: [{ type: String }],
    interests: [{ type: String }],
    maritalStatus: {
      type: String,
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
    hidePhotos: { type: Boolean, default: false },
    profilePhotoVisibility: {
      type: String,
      enum: ['everyone', 'registered', 'connected'],
      default: 'registered',
    },
    photoVisibility: {
      type: String,
      enum: ['everyone', 'registered', 'connected'],
      default: 'connected',
    },

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
      region: [{ type: String }],
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

    // Profile likes (received)
    likeCount: { type: Number, default: 0 },

    // Photo view requests (from other users requesting to see blurred photos)
    photoViewRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Photo view approvals (users who are approved to view my profile/chat)
    photoViewApproved: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Contact share requests
    contactShareRequests: [{
      fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
      unlockedByRequester: { type: Boolean, default: false }, // paid 299
      createdAt: { type: Date, default: Date.now },
    }],

    // Fake review flag (admin only)
    isFeaturedTestimonial: { type: Boolean, default: false },

    // User settings (notifications & privacy)
    settings: {
      notifications: {
        messages: { type: Boolean, default: true },
        matches: { type: Boolean, default: true },
        profileViews: { type: Boolean, default: false },
        promotions: { type: Boolean, default: false },
      },
      privacy: {
        showOnlineStatus: { type: Boolean, default: true },
        showLastSeen: { type: Boolean, default: true },
      },
    },

    // Admin access
    isAdmin: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ['user', 'admin', 'cacc', 'fasm', 'superadmin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (['admin', 'cacc', 'fasm', 'superadmin'].includes(this.role)) {
    this.isAdmin = true;
  } else {
    this.isAdmin = false;
  }

  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  
  // Calculate profile completeness
  const fields = ['name', 'age', 'height', 'education', 'cast', 'region', 'city', 'about', 'hobbies', 'interests', 'photos'];
  const filledCount = fields.filter((f) => {
    const val = this[f];
    if (!val) return false;
    if (Array.isArray(val)) return val.length > 0;
    return true;
  }).length;
  this.profileCompleteness = Math.round((filledCount / fields.length) * 100);
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

// Get main profile photo (blurred unless viewer is owner or approved or photos not hidden)
userSchema.methods.getProfilePhoto = function (viewerId = null) {
  const mainPhoto = this.photos.find((p) => p.isMain) || this.photos[0];
  if (!mainPhoto) return null;

  // If viewing own photo, always unblurred
  if (viewerId && String(this._id) === String(viewerId)) {
    return mainPhoto.url;
  }

  const visibility = this.profilePhotoVisibility || this.photoVisibility || (this.hidePhotos ? 'connected' : 'everyone');

  // If photos are public to all signed-in users, show unblurred.
  if (!this.hidePhotos || visibility === 'everyone' || visibility === 'registered') {
    return mainPhoto.url;
  }

  // Check if viewer is in photoViewApproved
  const isApproved = viewerId && this.photoViewApproved?.some(
    (uid) => String(uid) === String(viewerId)
  );

  if (isApproved) {
    return mainPhoto.url;
  }

  // Default is blurred
  return mainPhoto.blurredUrl || mainPhoto.url;
};

// Check if account is suspended
userSchema.methods.isSuspended = function () {
  if (this.status === 'suspended' && this.suspendedUntil) {
    if (new Date() < new Date(this.suspendedUntil)) return true;
    // Auto-lift suspension (use updateOne to avoid validation errors)
    mongoose.model('User').updateOne({ _id: this._id }, { status: 'active', suspendedUntil: null }).catch(() => { });
  }
  return false;
};

// Virtual: isSubscribed
userSchema.virtual('isSubscribed').get(function () {
  return this.hasActiveSubscription();
});

userSchema.set('toJSON', { virtuals: true });

// Performance Indexes for matchmaking search filter speedups
userSchema.index({ gender: 1, isOnline: 1, isVerified: 1 });
userSchema.index({ city: 1, region: 1 });
userSchema.index({ cast: 1, sect: 1 });
userSchema.index({ age: 1, profileCompleteness: 1 });
userSchema.index({ 'subscription.isActive': 1, 'subscription.endDate': 1 });
userSchema.index({ 'boost.isActive': 1, 'boost.endDate': 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
