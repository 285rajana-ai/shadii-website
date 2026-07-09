// Production backend on Railway — works on any network, no WiFi dependency
export const API_BASE_URL = 'https://shadi-production.up.railway.app/api';

export const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 1000,
    duration: '1 Month',
    color: '#8B1A4A',
    features: ['Unlimited messaging', 'View contact details', 'Daily matches'],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 2500,
    duration: '3 Months',
    color: '#D4AF37',
    popular: true,
    features: ['Unlimited messaging', 'View blurred photos', 'See who viewed you', 'Priority search'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 5000,
    duration: '6 Months',
    color: '#5C0F31',
    features: ['Everything in Standard', 'View all photos', 'Premium badge', 'Top of results', 'Free boost included'],
  },
];

export const PLAY_BILLING_PRODUCT_IDS = {
  basic: 'pk.shadii.basic_1m',
  standard: 'pk.shadii.standard_3m',
  premium: 'pk.shadii.premium_6m',
  boost: 'pk.shadii.boost_3d',
  contact_unlock: 'pk.shadii.contact_unlock',
};

export const PAYMENT_METHODS = [
  { id: 'google_play', name: 'Google Play', icon: 'google-play', color: '#34A853' },
  { id: 'easypaisa', name: 'EasyPaisa', icon: 'cellphone', color: '#4CAF50' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: 'bank-outline', color: '#9B59B6' },
];

export const CONTACT_UNLOCK_PRICE = 299;

export function getPlayProductIdForPlan(planId) {
  return PLAY_BILLING_PRODUCT_IDS[planId] || null;
}

export function getPlanIdFromPlayProductId(productId) {
  return Object.keys(PLAY_BILLING_PRODUCT_IDS).find((planId) => PLAY_BILLING_PRODUCT_IDS[planId] === productId) || null;
}

export const EDUCATION_LEVELS = [
  'Matric', 'Intermediate', 'Bachelors', 'Masters', 'PhD', 'Other',
];

export const PAKISTAN_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Bahawalpur',
  'Sargodha', 'Abbottabad', 'Mirpur AJK', 'Muzaffarabad', 'Other',
];

export const PAKISTAN_REGIONS = [
  'Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan',
  'Islamabad Capital Territory', 'Azad Jammu & Kashmir', 'Gilgit-Baltistan', 'Overseas Pakistani',
];

export const MARITAL_STATUS_OPTIONS = ['Never Married', 'Divorced', 'Widowed', 'Separated'];

export const SECT_OPTIONS = ['Sunni', 'Shia', 'Deobandi', 'Barelvi', 'Ahl-e-Hadith', 'Other'];

export const MOTHER_TONGUE_OPTIONS = ['Urdu', 'Punjabi', 'Sindhi', 'Pashto', 'Balochi', 'Saraiki', 'Kashmiri', 'Hindko', 'Other'];

export const PHOTO_VISIBILITY_OPTIONS = [
  { id: 'everyone', label: 'Everyone', helper: 'Visible on browse cards' },
  { id: 'registered', label: 'Registered Users', helper: 'Only signed-in members' },
  { id: 'connected', label: 'Connected Users', helper: 'After Rishta approval' },
];

export const CAST_OPTIONS = [
  'Abbasi', 'Ansari', 'Arain', 'Awan', 'Baloch', 'Bhatti', 'Bosan', 'Butt',
  'Chaudhry', 'Dogar', 'Farooqi', 'Gakhar', 'Gill', 'Gujjar', 'Hashmi', 'Janjua',
  'Jatt', 'Joya', 'Kakazai', 'Khan', 'Kharal', 'Khokhar', 'Malik', 'Memon',
  'Mughal', 'Naqvi', 'Pathan', 'Qureshi', 'Rajput', 'Siddiqui', 'Sheikh',
  'Syed', 'Tarar', 'Tiwana', 'Warraich', 'Wattoo', 'Yousafzai', 'Other',
];

export const INTERESTS = [
  'Reading 📚', 'Cooking 🍳', 'Travel ✈️', 'Sports ⚽', 'Music 🎵',
  'Art 🎨', 'Photography 📷', 'Gaming 🎮', 'Fitness 💪', 'Technology 💻',
  'Fashion 👗', 'Movies 🎬', 'Nature 🌿', 'Volunteering ❤️', 'Business 💼',
];

export const REPORT_REASONS = [
  { id: 'fake_profile', label: 'Fake Profile', icon: '🚫' },
  { id: 'harassment', label: 'Harassment', icon: '⚠️' },
  { id: 'inappropriate_content', label: 'Inappropriate Content', icon: '🔞' },
  { id: 'scam', label: 'Scam / Fraud', icon: '💰' },
  { id: 'spam', label: 'Spam', icon: '📧' },
  { id: 'other', label: 'Other', icon: '❓' },
];

export const CONTACT_EMAILS = {
  admin: 'support@shadii.pk',
  help: 'help@shadii.pk',
  support: 'support@shadii.pk',
  abuse: 'support@shadii.pk',
};

export const APP_NAME = 'Shadii.pk';
export const APP_TAGLINE = 'ہم قدم: ایک مکمل زندگی کا سفر';

export const BOOST_PRICE = 500;
export const BOOST_DURATION_DAYS = 3;
