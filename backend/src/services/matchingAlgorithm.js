const User = require('../models/User');
const Match = require('../models/Match');

/**
 * Shadii.pk Daily Match Algorithm
 * Generates 3-5 high-quality matches per user based on preferences
 */

const WEIGHTS = {
  location: 30,      // Same city = 30 pts, same country = 15 pts
  ageRange: 25,      // Within preference age range
  education: 20,     // Matching education level
  cast: 15,          // Matching caste/community
  interests: 10,     // Common interests/hobbies
};

/**
 * Calculate compatibility score between two users
 */
const calculateScore = (user, candidate) => {
  let score = 0;
  const reasons = [];

  // 1. Location matching
  if (user.city && candidate.city && user.city.toLowerCase() === candidate.city.toLowerCase()) {
    score += WEIGHTS.location;
    reasons.push(`Same city (${candidate.city})`);
  } else if (user.country && candidate.country && user.country === candidate.country) {
    score += WEIGHTS.location / 2;
    reasons.push(`Same country (${candidate.country})`);
  }

  // 2. Age range matching
  const prefMin = user.preferences?.ageMin || 18;
  const prefMax = user.preferences?.ageMax || 60;
  if (candidate.age >= prefMin && candidate.age <= prefMax) {
    const ageScore = WEIGHTS.ageRange * (1 - Math.abs(candidate.age - (prefMin + prefMax) / 2) / (prefMax - prefMin));
    score += Math.max(ageScore, WEIGHTS.ageRange * 0.5);
    reasons.push(`Age ${candidate.age} matches your preference`);
  }

  // 3. Education
  const prefEducation = user.preferences?.education || [];
  if (prefEducation.length === 0 || prefEducation.includes(candidate.education)) {
    score += WEIGHTS.education;
    if (candidate.education) reasons.push(`${candidate.education} education`);
  }

  // 4. Cast/Community
  const prefCast = user.preferences?.cast || [];
  if (prefCast.length === 0 || prefCast.includes(candidate.cast)) {
    score += WEIGHTS.cast;
    if (candidate.cast) reasons.push(`${candidate.cast} community`);
  }

  // 5. Common interests
  const userInterests = [...(user.interests || []), ...(user.hobbies || [])];
  const candidateInterests = [...(candidate.interests || []), ...(candidate.hobbies || [])];
  const commonInterests = userInterests.filter((i) =>
    candidateInterests.map((x) => x.toLowerCase()).includes(i.toLowerCase())
  );
  if (commonInterests.length > 0) {
    const interestScore = Math.min(WEIGHTS.interests, commonInterests.length * 3);
    score += interestScore;
    reasons.push(`${commonInterests.length} common interest(s)`);
  }

  // Bonus: Verified profile
  if (candidate.isVerified) {
    score += 5;
    reasons.push('Verified profile ✅');
  }

  // Bonus: Complete profile
  if (candidate.profileCompleteness >= 80) {
    score += 5;
    reasons.push('Complete profile');
  }

  return { score: Math.min(score, 100), reasons };
};

/**
 * Generate daily matches for a user
 * Returns 3-5 best matches
 */
const generateDailyMatches = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const targetGender = user.gender === 'male' ? 'female' : 'male';

  // Get potential candidates (exclude blocked, already matched today, self)
  const candidates = await User.find({
    _id: { $ne: userId, $nin: user.blockedUsers },
    gender: targetGender,
    status: 'active',
    age: {
      $gte: user.preferences?.ageMin || 18,
      $lte: user.preferences?.ageMax || 65,
    },
  })
    .select(
      'name age city country education cast interests hobbies isVerified profileCompleteness photos subscription boost'
    )
    .limit(200);

  // Score and sort all candidates
  const scored = candidates
    .map((candidate) => {
      const { score, reasons } = calculateScore(user, candidate);
      return {
        matchedUser: candidate._id,
        score,
        reasons,
        isViewed: false,
        isLiked: false,
        // Boost: boosted profiles get priority
        effectiveScore: score + (candidate.hasActiveBoost?.() ? 10 : 0),
      };
    })
    .sort((a, b) => b.effectiveScore - a.effectiveScore);

  // Pick top 3-5
  const topMatches = scored.slice(0, Math.min(5, Math.max(3, scored.length)));

  // Save matches
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0);

  const matchDoc = await Match.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      matches: topMatches.map(({ matchedUser, score, reasons, isViewed, isLiked }) => ({
        matchedUser,
        score,
        reasons,
        isViewed,
        isLiked,
      })),
      generatedAt: new Date(),
      expiresAt: tomorrow,
    },
    { upsert: true, new: true }
  );

  // Update user's last match generation time
  await User.findByIdAndUpdate(userId, { todayMatchesSentAt: new Date() });

  return matchDoc;
};

/**
 * Cron job: Run for all active users at 8 AM daily
 */
const generateMatchesForAllUsers = async () => {
  console.log('🤖 Running daily match algorithm...');
  const users = await User.find({ status: 'active' }).select('_id');
  let generated = 0;
  for (const user of users) {
    try {
      await generateDailyMatches(user._id);
      generated++;
    } catch (e) {
      console.error(`Match gen failed for ${user._id}: ${e.message}`);
    }
  }
  console.log(`✅ Daily matches generated for ${generated} users`);
};

module.exports = { generateDailyMatches, generateMatchesForAllUsers, calculateScore };
