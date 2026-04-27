// For physical device testing use your Mac's LAN IP (not localhost)
// Run `ifconfig | grep "inet " | grep -v 127` to get your IP
export const API_BASE_URL = 'http://192.168.10.102:5001/api';

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

export const PAYMENT_METHODS = [
  { id: 'easypaisa', name: 'EasyPaisa', icon: 'phone-android', color: '#4CAF50' },
  { id: 'jazzcash', name: 'JazzCash', icon: 'phone-iphone', color: '#FF5722' },
  { id: 'card', name: 'Credit/Debit Card', icon: 'credit-card', color: '#3498DB' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: 'account-balance', color: '#607D8B' },
];

export const EDUCATION_LEVELS = [
  'Matric', 'Intermediate', 'Bachelors', 'Masters', 'PhD', 'Other',
];

export const PAKISTAN_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Bahawalpur',
  'Sargodha', 'Abbottabad', 'Mirpur AJK', 'Muzaffarabad', 'Other',
];

export const CAST_OPTIONS = [
  'Arain', 'Jatt', 'Rajput', 'Awan', 'Sheikh', 'Syed', 'Mughal',
  'Baloch', 'Pathan', 'Gujjar', 'Ansari', 'Chaudhry', 'Other',
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
  admin: 'admin@shadii.pk',
  help: 'help@shadii.pk',
  support: 'support@shadii.pk',
  abuse: 'abuse@shadii.pk',
};

export const APP_NAME = 'Shadii.pk';
export const APP_TAGLINE = 'ہم قدم: ایک مکمل زندگی کا سفر';

export const BOOST_PRICE = 500;
export const BOOST_DURATION_DAYS = 3;
