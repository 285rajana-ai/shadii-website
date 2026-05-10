const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User');
const { sendEmail } = require('../config/mailer');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const upload = multer({ dest: '/tmp/', limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/profile/discover — browse profiles with full filter support
router.get('/discover', protect, async (req, res) => {
  try {
    const {
      gender, ageMin, ageMax, city, country, education, cast,
      maritalStatus, sect, motherTongue,
      verifiedOnly, withPhotoOnly,
      sort = 'newest', page = 1, limit = 20,
    } = req.query;

    const me = req.user;
    const targetGender = gender || (me.gender === 'male' ? 'female' : 'male');

    const filter = {
      _id: { $ne: me._id, $nin: me.blockedUsers || [] },
      gender: targetGender,
      status: 'active',
    };

    // ── Age range ──────────────────────────────────────────────────────────
    if (ageMin || ageMax) {
      filter.age = {};
      if (ageMin) filter.age.$gte = Number(ageMin);
      if (ageMax) filter.age.$lte = Number(ageMax);
    }

    // ── Location ──────────────────────────────────────────────────────────
    if (city) filter.city = new RegExp(city, 'i');
    if (country) filter.country = new RegExp(country, 'i');

    // ── Education ─────────────────────────────────────────────────────────
    if (education) filter.education = education;

    // ── Cast / Community ──────────────────────────────────────────────────
    if (cast) filter.cast = new RegExp(cast, 'i');

    // ── Marital Status (NEW) ──────────────────────────────────────────────
    if (maritalStatus) filter.maritalStatus = maritalStatus;

    // ── Sect (NEW) ────────────────────────────────────────────────────────
    if (sect) filter.sect = new RegExp(sect, 'i');

    // ── Mother Tongue (NEW) ───────────────────────────────────────────────
    if (motherTongue) filter.motherTongue = new RegExp(motherTongue, 'i');

    // ── Verified Only (NEW) ───────────────────────────────────────────────
    if (verifiedOnly === 'true') filter.isVerified = true;

    // ── With Photo Only (NEW) ─────────────────────────────────────────────
    if (withPhotoOnly === 'true') filter['photos.0'] = { $exists: true };

    // ── Sort ──────────────────────────────────────────────────────────────
    let sortObj = { createdAt: -1 };
    if (sort === 'active') sortObj = { lastActive: -1 };
    if (sort === 'premium') sortObj = { 'subscription.isActive': -1, createdAt: -1 };
    if (sort === 'nearby') sortObj = { city: 1, createdAt: -1 };
    if (sort === 'boosted') sortObj = { 'boost.isActive': -1, 'boost.endDate': -1, createdAt: -1 };
    if (sort === 'verified') sortObj = { isVerified: -1, createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('name age city country education cast maritalStatus motherTongue sect interests hobbies photos isVerified isOnline lastActive subscription boost gender')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    const viewerSubscribed = me.hasActiveSubscription();

    const profiles = users.map((u) => ({
      id: u._id,
      name: u.name,
      age: u.age,
      city: u.city,
      country: u.country,
      education: u.education,
      cast: u.cast,
      maritalStatus: u.maritalStatus,
      motherTongue: u.motherTongue,
      sect: u.sect,
      isVerified: u.isVerified,
      isOnline: u.isOnline,
      lastActive: u.lastActive,
      isBoosted: u.hasActiveBoost?.() || false,
      isPremium: u.subscription?.plan === 'premium' && u.subscription?.isActive,
      photo: u.getProfilePhoto(viewerSubscribed),
      isPhotoBlurred: u.gender === 'female' && u.isVerified && !viewerSubscribed,
      interests: u.interests?.slice(0, 3),
    }));

    res.json({
      success: true,
      profiles,
      total,
      page: Number(page),
      hasMore: skip + users.length < total,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// GET /api/profile/blocked — list blocked users (MUST be before /:id)
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

// GET /api/profile/settings — get settings (MUST be before /:id)
router.get('/settings', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings');
    res.json({ success: true, settings: user.settings || {} });
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

// POST /api/profile/photo — upload profile photo (stores as base64 data URI)
router.post('/photo', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No photo uploaded' });

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Only JPEG, PNG, and WebP images are allowed' });
    }

    // Read file and convert to base64 data URI
    const fileBuffer = fs.readFileSync(req.file.path);
    const base64 = fileBuffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64}`;

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    const user = await User.findById(req.user.id);
    const photoObj = {
      url: dataUri,
      blurredUrl: null,
      publicId: `local_${Date.now()}`,
      isMain: user.photos.length === 0,
    };

    user.photos.push(photoObj);
    await user.save();

    res.json({ success: true, photo: photoObj, message: 'Photo uploaded successfully' });
  } catch (err) {
    console.error('Photo upload error:', err.message);
    res.status(500).json({ success: false, message: 'Photo upload failed. Please try again.' });
  }
});

// POST /api/profile/verify — submit verification (stores as base64, no Cloudinary needed)
router.post('/verify', protect, upload.fields([{ name: 'cnicFront' }, { name: 'cnicBack' }, { name: 'livePhoto' }]), async (req, res) => {
  try {
    const { files } = req;
    if (!files?.cnicFront || !files?.cnicBack || !files?.livePhoto) {
      return res.status(400).json({ success: false, message: 'Please upload CNIC front, back, and live photo' });
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const toDataUri = (file) => {
      const f = Array.isArray(file) ? file[0] : file;
      if (!allowedMimeTypes.includes(f.mimetype)) throw new Error(`Invalid file type: ${f.mimetype}`);
      const buf = fs.readFileSync(f.path);
      fs.unlinkSync(f.path);
      return `data:${f.mimetype};base64,${buf.toString('base64')}`;
    };

    const cnicFrontUri = toDataUri(files.cnicFront);
    const cnicBackUri = toDataUri(files.cnicBack);
    const livePhotoUri = toDataUri(files.livePhoto);

    await User.findByIdAndUpdate(req.user.id, {
      cnicFront: cnicFrontUri,
      cnicBack: cnicBackUri,
      livePhoto: livePhotoUri,
      verificationStatus: 'pending',
    });

    res.json({ success: true, message: 'Verification submitted! Our team will review within 24-48 hours.' });
  } catch (err) {
    console.error('Verification upload error:', err.message);
    res.status(500).json({ success: false, message: 'Verification upload failed. Please try again.' });
  }
});

// PUT /api/profile/settings — save notification & privacy settings
router.put('/settings', protect, async (req, res) => {
  try {
    const { notifications, privacy } = req.body;
    const update = {};
    if (notifications) update['settings.notifications'] = notifications;
    if (privacy) update['settings.privacy'] = privacy;
    const user = await User.findByIdAndUpdate(req.user.id, { $set: update }, { new: true });
    res.json({ success: true, settings: user.settings });
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

// POST /api/profile/:id/like — toggle like on a profile
router.post('/:id/like', protect, async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot like your own profile' });
    }
    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    // Increment like count on the target user
    await User.findByIdAndUpdate(targetId, { $inc: { likeCount: 1 } });
    res.json({ success: true, message: 'Liked' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// POST /api/profile/:id/request-photo — request to view someone's photos
router.post('/:id/request-photo', protect, async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    const alreadyRequested = target.photoViewRequests?.some(
      (uid) => uid.toString() === req.user._id.toString()
    );
    if (alreadyRequested) return res.json({ success: true, message: 'Already requested' });

    target.photoViewRequests = target.photoViewRequests || [];
    target.photoViewRequests.push(req.user._id);
    await target.save();

    // Emit real-time notification if socket available
    const io = req.app.get('io');
    if (io) {
      io.to(`${target._id}`).emit('photo:request', {
        fromUser: { _id: req.user._id, name: req.user.name },
      });
    }

    res.json({ success: true, message: 'Photo view request sent' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/profile/:id/contact-request — request contact sharing (PKR 299 unlock)
router.post('/:id/contact-request', protect, async (req, res) => {
  try {
    const me = req.user;
    if (!me.hasActiveSubscription()) {
      return res.status(403).json({ success: false, message: 'Subscription required' });
    }

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    target.contactShareRequests = target.contactShareRequests || [];
    const existing = target.contactShareRequests.find(
      (r) => r.fromUser.toString() === me._id.toString()
    );
    if (existing) return res.json({ success: true, message: 'Already requested', status: existing.status });

    target.contactShareRequests.push({ fromUser: me._id });
    await target.save();

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(`${target._id}`).emit('contact:request', {
        fromUser: { _id: me._id, name: me.name },
      });
    }

    res.json({ success: true, message: 'Contact share request sent' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PUT /api/profile/contact-requests/:requestId/respond — accept or reject a contact share request
router.put('/contact-requests/:requestId/respond', protect, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const me = await User.findById(req.user._id);
    const request = me.contactShareRequests?.id(req.params.requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    request.status = status;
    await me.save();

    // Notify the requester
    const io = req.app.get('io');
    if (io) {
      io.to(`${request.fromUser}`).emit('contact:response', {
        fromUser: { _id: me._id, name: me.name },
        status,
      });
    }

    res.json({ success: true, message: `Request ${status}` });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PUT /api/profile/photo-requests/:userId/respond — accept/reject photo view request
router.put('/photo-requests/:userId/respond', protect, async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    const me = await User.findById(req.user._id);

    if (action === 'accept') {
      // do nothing extra — the viewer can see photos after acceptance tracked on client
    } else {
      // remove from photoViewRequests
      me.photoViewRequests = (me.photoViewRequests || []).filter(
        (uid) => uid.toString() !== req.params.userId
      );
    }

    await me.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`${req.params.userId}`).emit('photo:response', {
        fromUser: { _id: me._id, name: me.name },
        accepted: action === 'accept',
      });
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/profile/incoming-requests — get all incoming photo + contact share requests
router.get('/incoming-requests', protect, async (req, res) => {
  try {
    const me = await User.findById(req.user._id)
      .populate('photoViewRequests', 'name photos age city')
      .populate('contactShareRequests.fromUser', 'name photos age city');

    res.json({
      success: true,
      photoRequests: me.photoViewRequests || [],
      contactRequests: (me.contactShareRequests || []).filter((r) => r.status === 'pending'),
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
