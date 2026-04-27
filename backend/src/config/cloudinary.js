const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param {string} filePath - local file path or base64
 * @param {string} folder - cloudinary folder
 * @param {object} options - extra options (blur, etc.)
 */
const uploadImage = async (filePath, folder = 'shadii', options = {}) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: `shadii/${folder}`,
    resource_type: 'image',
    ...options,
  });
  return result;
};

/**
 * Upload profile photo with blur transformation for females
 */
const uploadProfilePhoto = async (filePath, userId, gender) => {
  const result = await uploadImage(filePath, 'profiles', {
    public_id: `profile_${userId}`,
    overwrite: true,
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });

  let blurredUrl = null;
  if (gender === 'female') {
    // Create blurred version URL using Cloudinary transformation
    blurredUrl = cloudinary.url(result.public_id, {
      transformation: [
        { effect: 'blur:800', quality: 30 },
        { overlay: { font_family: 'Arial', font_size: 40, text: '🔒 Subscribe to view' }, gravity: 'center', color: 'white' },
      ],
      format: 'jpg',
    });
  }

  return {
    originalUrl: result.secure_url,
    blurredUrl,
    publicId: result.public_id,
  };
};

/**
 * Upload CNIC for verification
 */
const uploadCNIC = async (filePath, userId, side = 'front') => {
  return uploadImage(filePath, 'verification/cnic', {
    public_id: `cnic_${userId}_${side}`,
    overwrite: true,
  });
};

/**
 * Upload live verification photo
 */
const uploadLivePhoto = async (filePath, userId) => {
  return uploadImage(filePath, 'verification/live', {
    public_id: `live_${userId}`,
    overwrite: true,
  });
};

const deleteImage = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

module.exports = { cloudinary, uploadImage, uploadProfilePhoto, uploadCNIC, uploadLivePhoto, deleteImage };
