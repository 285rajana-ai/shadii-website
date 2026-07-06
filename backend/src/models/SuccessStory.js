const mongoose = require('mongoose');

const successStorySchema = new mongoose.Schema(
  {
    coupleNames: { type: String, required: true },
    storyText: { type: String, required: true },
    image: { type: String }, // URL to image (Cloudinary or fallback)
    isApproved: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SuccessStory', successStorySchema);
