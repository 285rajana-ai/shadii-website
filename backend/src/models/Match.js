const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    matches: [
      {
        matchedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        score: { type: Number }, // compatibility score 0-100
        reasons: [{ type: String }], // why they matched
        isViewed: { type: Boolean, default: false },
        isLiked: { type: Boolean, default: false },
      },
    ],
    generatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }, // next day
  },
  { timestamps: true }
);

matchSchema.index({ user: 1, generatedAt: -1 });

module.exports = mongoose.model('Match', matchSchema);
