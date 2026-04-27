const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User');
const { uploadProfilePhoto, uploadCNIC, uploadLivePhoto } = require('../config/cloudinary');
const { sendEmail } = require('../config/mailer');
const multer = require('multer');
const upload = multer({ dest: '/tmp/' });

// GET /api/profile/discover — browse profiles with filters
router.get('/discover', protect, async (req, res) => {
  try {
    const {
      gender, ageMin, ageMax, city, country, education, cast,
      sort = 'newest', page = 1, limit = 20,
    } = req.query;

    const me = req.user;
    const targetGender = gender || (me.gender === 'male' ? 'female' : 'male');

    const filter = {
      _id: { $ne: me._id, $nin: me.blockedUsers },
      gender: targetGender,
      status: 'active',
    };

    if (ageMin || ageMax) {
      filter.age = {};
      if (ageMin) filter.age.$gte = Number(ageMin);
      if (ageMax) filter.age.$lte = Number(ageMax);
    }
    if (city) filter.city = new RegExp(city, 'i');
    if (country) filter.country = new RegExp(country, 'i');
    if (education) filter.education = education;
    if (cast) filter.cast = new RegExp(cast, 'i');

    let sortObj = { createdAt: -1 };
    if (sort === 'active') sortObj = { lastActive: -1 };
    if (sort === 'premium') sortObj = { 'subscription.isActive': -1, createdAt: -1 };
    if (sort === 'nearby') sortObj = { city: 1, createdAt: -1 };
    if (sort === 'boosted') sortObj = { 'boost.isActive': -1, createdAt: -1 };

    const users = await User.find(filter)
      .select('name age city country education cast interests hobbies photos isVerified isOnline lastActive subscription boost gender')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const viewerSubscribed = me.hasActiveSubscription();
    const total = await User.countDocuments(filter);

    const profiles = users.map((u) => ({
      id: u._id,
      name: u.name,
      age: u.age,
      city: u.city,
      country: u.country,
      education: u.education,
      cast: u.cast,
      isVerified: u.isVerified,
      isOnline: u.isOnline,
      lastActive: u.lastActive,
      isBoosted: u.hasActiveBoost?.() || false,
      isPremium: u.subscription?.plan === 'premium',
      photo: u.getProfilePhoto(viewerSubscribed),
      isPhotoBlurred: u.gender === 'female' && u.isVerified && !viewerSubscribed,
      interests: u.interests?.slice(0, 3),
    }));

    res.json({ success: true, profiles, total, page: Number(page), hasMore: page * limit < total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/profile/:id — view profile
router.get('/:id', protect, async (req, res) => {
  try {
    const profile = await User.findById(req.params.id).select(
      '-password -otp -otpExpiry -fcmToken -cnicFront -cnicBack -livePhoto'
    );
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    // Increment view count
    await User.findByIdAndUpdate(req.params.id, { $inc: { profileViews: 1 } });

    const viewerSubscribed = req.user.hasActiveSubscription();

    res.json({
      success: true,
      profile: {
        ...profile.toJSON(),
        photo: profile.getProfilePhoto(viewerSubscribed),
        isPhotoBlurred: profile.gender === 'female' && profile.isVerified && !viewerSubscribed,
        isBlocked: req.user.blockedUsers?.includes(profile._id),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/profile/update
router.put('/update', protect, async (req, res) => {
  try {
    const allowedFields = [
      'name', 'age', 'height', 'education', 'cast', 'country', 'city',
      'about', 'hobbies', 'interests', 'maritalStatus', 'motherTongue', 'sect', 'preferences',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Calculate completeness
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    const fields = ['name', 'age', 'height', 'education', 'cast', 'city', 'about', 'hobbies', 'interests', 'photos'];
    const completeness = Math.round((fields.filter((f) => user[f] && (Array.isArray(user[f]) ? user[f].length > 0 : true)).length / fields.length) * 100);
    await User.findByIdAndUpdate(req.user.id, { profileCompleteness: completeness });

    res.json({ success: true, message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/profile/photo — upload profile photo
router.post('/photo', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No photo uploaded' });

    const result = await uploadProfilePhoto(req.file.path, req.user.id, req.user.gender);

    const user = await User.findById(req.user.id);
    const photoObj = {
      url: result.originalUrl,
      blurredUrl: result.blurredUrl,
      publicId: result.publicId,
      isMain: user.photos.length === 0,
    };

    user.photos.push(photoObj);
    await user.save();

    res.json({ success: true, photo: photoObj, message: 'Photo uploaded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/profile/verify — submit verification
router.post('/verify', protect, upload.fields([{ name: 'cnicFront' }, { name: 'cnicBack' }, { name: 'livePhoto' }]), async (req, res) => {
  try {
    const { files } = req;
    if (!files.cnicFront || !files.cnicBack || !files.livePhoto) {
      return res.status(400).json({ success: false, message: 'Please upload CNIC front, back, and live photo' });
    }

    const [cnicFront, cnicBack, livePhotoResult] = await Promise.all([
      uploadCNIC(files.cnicFront[0].path, req.user.id, 'front'),
      uploadCNIC(files.cnicBack[0].path, req.user.id, 'back'),
      uploadLivePhoto(files.livePhoto[0].path, req.user.id),
    ]);

    await User.findByIdAndUpdate(req.user.id, {
      cnicFront: cnicFront.secure_url,
      cnicBack: cnicBack.secure_url,
      livePhoto: livePhotoResult.secure_url,
      verificationStatus: 'pending',
    });

    res.json({ success: true, message: 'Verification submitted! Our team will review within 24-48 hours.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/profile/blocked — list blocked users
router.get('/blocked', protect, async (req, res) => {
  try {
    const me = await User.findById(req.user.id).populate('blockedUsers', 'name age city photos isVerified');
    const users = (me.blockedUsers || []).map((u) => ({
      _id: u._id,
      name: u.name,
      age: u.age,
      city: u.city,
      photo: u.photos?.find((p) => p.isMain)?.url || u.photos?.[0]?.url || null,
      isVerified: u.isVerified,
    }));
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/profile/block/:userId
router.post('/block/:userId', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { blockedUsers: req.params.userId } });
    res.json({ success: true, message: 'User blocked successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/profile/unblock/:userId
router.post('/unblock/:userId', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $pull: { blockedUsers: req.params.userId } });
    res.json({ success: true, message: 'User unblocked' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
