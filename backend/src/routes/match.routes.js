const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User');
const Match = require('../models/Match');
const { generateDailyMatches } = require('../services/matchingAlgorithm');

// GET /api/matches/today — today's matches
router.get('/today', protect, async (req, res) => {
  try {
    let matchDoc = await Match.findOne({ user: req.user.id })
      .populate('matches.matchedUser', 'name age city country education cast interests photos isVerified isOnline lastActive subscription boost gender photoViewApproved')
      .sort({ generatedAt: -1 });

    // Generate if not today's matches
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!matchDoc || new Date(matchDoc.generatedAt) < today) {
      matchDoc = await generateDailyMatches(req.user.id);
      matchDoc = await Match.findById(matchDoc._id).populate(
        'matches.matchedUser',
        'name age city country education cast interests photos isVerified isOnline lastActive subscription boost gender photoViewApproved hidePhotos'
      );
    }

    const matches = matchDoc?.matches?.map((m) => {
      const u = m.matchedUser;
      if (!u) return null;
      const isConnected = u.photoViewApproved?.some(
        (uid) => String(uid) === String(req.user.id)
      );
      const mainPhoto = u.photos.find((p) => p.isMain) || u.photos[0];
      return {
        id: u._id,
        name: u.name,
        age: u.age,
        city: u.city,
        education: u.education,
        isVerified: u.isVerified,
        isOnline: u.isOnline,
        photo: (u.hidePhotos === false || isConnected) ? (mainPhoto?.url || null) : u.getProfilePhoto(req.user.id),
        isPhotoBlurred: u.hidePhotos ? !isConnected : false,
        interests: u.interests?.slice(0, 3),
        matchScore: m.score,
        matchReasons: m.reasons,
        isViewed: m.isViewed,
        isLiked: m.isLiked,
      };
    }).filter(Boolean);

    res.json({ success: true, matches: matches || [], generatedAt: matchDoc?.generatedAt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/matches/:matchedUserId/like
router.post('/:matchedUserId/like', protect, async (req, res) => {
  try {
    await Match.updateOne(
      { user: req.user.id, 'matches.matchedUser': req.params.matchedUserId },
      { $set: { 'matches.$.isLiked': true, 'matches.$.isViewed': true } }
    );
    res.json({ success: true, message: 'Match liked!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
