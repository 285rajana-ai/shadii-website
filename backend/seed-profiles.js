const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

const ATLAS_HOSTS = [
    'ac-b7nm95o-shard-00-00.nq4a2dl.mongodb.net:27017',
    'ac-b7nm95o-shard-00-01.nq4a2dl.mongodb.net:27017',
    'ac-b7nm95o-shard-00-02.nq4a2dl.mongodb.net:27017',
].join(',');

// Realistic Pakistani dummy profiles with public Unsplash avatar URLs
const profiles = [
    {
        gender: 'male', name: 'Bilal Ahmed', email: 'bilal.ahmed@test.pk',
        phone: '+923011111001', password: 'Test@1234', age: 28,
        city: 'Lahore', education: 'Masters', cast: 'Awan',
        about: 'Software engineer at a tech startup. Love cricket, travelling and trying new foods. Looking for a sincere and educated life partner.',
        hobbies: ['Cricket', 'Travelling', 'Cooking'], interests: ['Technology', 'Sports', 'Food'],
        maritalStatus: 'Never Married', motherTongue: 'Punjabi', religion: 'Islam',
        isVerified: true, isEmailVerified: true, isPhoneVerified: true,
        verificationStatus: 'approved', profileCompleteness: 90,
        photos: [{ url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', isMain: true }],
        subscription: { plan: 'premium', isActive: true, startDate: new Date(), endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
    },
    {
        gender: 'female', name: 'Ayesha Malik', email: 'ayesha.malik@test.pk',
        phone: '+923011111002', password: 'Test@1234', age: 25,
        city: 'Islamabad', education: 'Masters', cast: 'Malik',
        about: 'Doctor by profession, passionate about health and wellness. Family-oriented and looking for someone who values both career and family.',
        hobbies: ['Reading', 'Cooking', 'Yoga'], interests: ['Health', 'Literature', 'Travel'],
        maritalStatus: 'Never Married', motherTongue: 'Urdu', religion: 'Islam',
        isVerified: true, isEmailVerified: true, isPhoneVerified: true,
        verificationStatus: 'approved', profileCompleteness: 95,
        photos: [{ url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', isMain: true }],
        subscription: { plan: 'premium', isActive: true, startDate: new Date(), endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) },
    },
    {
        gender: 'male', name: 'Hassan Raza', email: 'hassan.raza@test.pk',
        phone: '+923011111003', password: 'Test@1234', age: 30,
        city: 'Karachi', education: 'Bachelors', cast: 'Syed',
        about: 'Business owner running an import-export company. Spiritual, family-loving person seeking a pious and educated wife.',
        hobbies: ['Fishing', 'Reading Quran', 'Badminton'], interests: ['Business', 'Religion', 'Sports'],
        maritalStatus: 'Never Married', motherTongue: 'Urdu', religion: 'Islam',
        isVerified: true, isEmailVerified: true, isPhoneVerified: true,
        verificationStatus: 'approved', profileCompleteness: 85,
        photos: [{ url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', isMain: true }],
    },
    {
        gender: 'female', name: 'Sana Iqbal', email: 'sana.iqbal@test.pk',
        phone: '+923011111004', password: 'Test@1234', age: 23,
        city: 'Lahore', education: 'Bachelors', cast: 'Iqbal',
        about: 'Graphic designer with a love for art and creativity. Simple, caring, and looking for an understanding partner.',
        hobbies: ['Painting', 'Photography', 'Baking'], interests: ['Art', 'Design', 'Music'],
        maritalStatus: 'Never Married', motherTongue: 'Punjabi', religion: 'Islam',
        isVerified: false, isEmailVerified: true, isPhoneVerified: true,
        profileCompleteness: 80,
        photos: [{ url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', isMain: true }],
    },
    {
        gender: 'male', name: 'Usman Khan', email: 'usman.khan@test.pk',
        phone: '+923011111005', password: 'Test@1234', age: 32,
        city: 'Peshawar', education: 'Masters', cast: 'Khan',
        about: 'Civil engineer working on infrastructure projects. Honest, hardworking and family-oriented. Looking for a supportive life partner.',
        hobbies: ['Hiking', 'Football', 'Photography'], interests: ['Nature', 'Sports', 'Travel'],
        maritalStatus: 'Never Married', motherTongue: 'Pashto', religion: 'Islam',
        isVerified: true, isEmailVerified: true, isPhoneVerified: true,
        verificationStatus: 'approved', profileCompleteness: 88,
        photos: [{ url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', isMain: true }],
        subscription: { plan: 'basic', isActive: true, startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    },
    {
        gender: 'female', name: 'Mariam Shah', email: 'mariam.shah@test.pk',
        phone: '+923011111006', password: 'Test@1234', age: 27,
        city: 'Rawalpindi', education: 'Masters', cast: 'Shah',
        about: 'University lecturer teaching English literature. Cultured, well-read, and looking for an intellectual and kind-hearted partner.',
        hobbies: ['Reading', 'Writing', 'Gardening'], interests: ['Literature', 'Education', 'Arts'],
        maritalStatus: 'Never Married', motherTongue: 'Urdu', religion: 'Islam',
        isVerified: true, isEmailVerified: true, isPhoneVerified: true,
        verificationStatus: 'approved', profileCompleteness: 93,
        photos: [{ url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', isMain: true }],
    },
    {
        gender: 'male', name: 'Farhan Siddiqui', email: 'farhan.siddiqui@test.pk',
        phone: '+923011111007', password: 'Test@1234', age: 29,
        city: 'Karachi', education: 'Bachelors', cast: 'Siddiqui',
        about: 'Marketing manager at a multinational company. Fun-loving, responsible, and ready to start a family.',
        hobbies: ['Gaming', 'Movies', 'Gym'], interests: ['Technology', 'Entertainment', 'Fitness'],
        maritalStatus: 'Never Married', motherTongue: 'Urdu', religion: 'Islam',
        isVerified: false, isEmailVerified: true, isPhoneVerified: true,
        profileCompleteness: 75,
        photos: [{ url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', isMain: true }],
    },
    {
        gender: 'female', name: 'Zainab Butt', email: 'zainab.butt@test.pk',
        phone: '+923011111008', password: 'Test@1234', age: 24,
        city: 'Multan', education: 'Bachelors', cast: 'Butt',
        about: 'Pharmacist working at a hospital. Caring, simple and devout. Looking for a God-fearing, responsible partner.',
        hobbies: ['Cooking', 'Calligraphy', 'Walking'], interests: ['Health', 'Religion', 'Family'],
        maritalStatus: 'Never Married', motherTongue: 'Punjabi', religion: 'Islam',
        isVerified: true, isEmailVerified: true, isPhoneVerified: true,
        verificationStatus: 'approved', profileCompleteness: 87,
        photos: [{ url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', isMain: true }],
        subscription: { plan: 'premium', isActive: true, startDate: new Date(), endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
    },
    {
        gender: 'male', name: 'Ali Nawaz', email: 'ali.nawaz@test.pk',
        phone: '+923011111009', password: 'Test@1234', age: 33,
        city: 'Faisalabad', education: 'Bachelors', cast: 'Nawaz',
        about: 'Textile businessman with a family-run company. Simple, honest and traditional values. Ready for nikah.',
        hobbies: ['Agriculture', 'Reading', 'Social Work'], interests: ['Business', 'Community', 'Religion'],
        maritalStatus: 'Never Married', motherTongue: 'Punjabi', religion: 'Islam',
        isVerified: false, isEmailVerified: true, isPhoneVerified: true,
        profileCompleteness: 72,
        photos: [{ url: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400', isMain: true }],
    },
    {
        gender: 'female', name: 'Hira Baig', email: 'hira.baig@test.pk',
        phone: '+923011111010', password: 'Test@1234', age: 26,
        city: 'Islamabad', education: 'Masters', cast: 'Baig',
        about: 'Civil servant (CSS officer). Ambitious, educated and looking for a like-minded partner who respects ambition.',
        hobbies: ['Reading', 'Debating', 'Travelling'], interests: ['Politics', 'Current Affairs', 'Law'],
        maritalStatus: 'Never Married', motherTongue: 'Urdu', religion: 'Islam',
        isVerified: true, isEmailVerified: true, isPhoneVerified: true,
        verificationStatus: 'approved', profileCompleteness: 96,
        photos: [{ url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400', isMain: true }],
        subscription: { plan: 'premium', isActive: true, startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
    },
    {
        gender: 'male', name: 'Kamran Mirza', email: 'kamran.mirza@test.pk',
        phone: '+923011111011', password: 'Test@1234', age: 31,
        city: 'Lahore', education: 'Masters', cast: 'Mirza',
        about: 'Chartered Accountant working at a Big 4 firm. Financially stable, responsible, and looking for a life partner.',
        hobbies: ['Investment', 'Cricket', 'Movies'], interests: ['Finance', 'Sports', 'Business'],
        maritalStatus: 'Never Married', motherTongue: 'Punjabi', religion: 'Islam',
        isVerified: true, isEmailVerified: true, isPhoneVerified: true,
        verificationStatus: 'approved', profileCompleteness: 91,
        photos: [{ url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', isMain: true }],
    },
    {
        gender: 'female', name: 'Nadia Chaudhry', email: 'nadia.chaudhry@test.pk',
        phone: '+923011111012', password: 'Test@1234', age: 28,
        city: 'Gujranwala', education: 'Bachelors', cast: 'Chaudhry',
        about: 'School teacher who loves to inspire young minds. Homely, sincere and looking for a caring husband.',
        hobbies: ['Teaching', 'Sewing', 'Cooking'], interests: ['Education', 'Family', 'Arts'],
        maritalStatus: 'Never Married', motherTongue: 'Punjabi', religion: 'Islam',
        isVerified: false, isEmailVerified: true, isPhoneVerified: true,
        profileCompleteness: 82,
        photos: [{ url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400', isMain: true }],
    },
    {
        gender: 'male', name: 'Zubair Ansari', email: 'zubair.ansari@test.pk',
        phone: '+923011111013', password: 'Test@1234', age: 27,
        city: 'Hyderabad', education: 'Bachelors', cast: 'Ansari',
        about: 'Pharmacist and fitness enthusiast. Healthy lifestyle advocate. Looking for an energetic and health-conscious partner.',
        hobbies: ['Gym', 'Cycling', 'Cooking Healthy'], interests: ['Fitness', 'Health', 'Science'],
        maritalStatus: 'Never Married', motherTongue: 'Sindhi', religion: 'Islam',
        isVerified: false, isEmailVerified: true, isPhoneVerified: true,
        profileCompleteness: 78,
        photos: [{ url: 'https://images.unsplash.com/photo-1542327897-d73f4005b533?w=400', isMain: true }],
    },
    {
        gender: 'female', name: 'Rimsha Tauqir', email: 'rimsha.tauqir@test.pk',
        phone: '+923011111014', password: 'Test@1234', age: 22,
        city: 'Sialkot', education: 'Bachelors', cast: 'Tauqir',
        about: 'Fresh computer science graduate. Tech-savvy, creative and looking for a modern yet traditional life partner.',
        hobbies: ['Gaming', 'Coding', 'Anime'], interests: ['Technology', 'Gaming', 'Arts'],
        maritalStatus: 'Never Married', motherTongue: 'Punjabi', religion: 'Islam',
        isVerified: false, isEmailVerified: true, isPhoneVerified: true,
        profileCompleteness: 70,
        photos: [{ url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', isMain: true }],
    },
    {
        gender: 'male', name: 'Shoaib Gillani', email: 'shoaib.gillani@test.pk',
        phone: '+923011111015', password: 'Test@1234', age: 34,
        city: 'Quetta', education: 'Masters', cast: 'Gillani',
        about: 'Medical doctor specializing in cardiology. Settled and ready for marriage. Looking for a supportive and caring partner.',
        hobbies: ['Medicine', 'Mountain Climbing', 'Reading'], interests: ['Health', 'Science', 'Nature'],
        maritalStatus: 'Never Married', motherTongue: 'Balochi', religion: 'Islam',
        isVerified: true, isEmailVerified: true, isPhoneVerified: true,
        verificationStatus: 'approved', profileCompleteness: 89,
        photos: [{ url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400', isMain: true }],
        subscription: { plan: 'basic', isActive: true, startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    },
];

const seedProfiles = async () => {
    try {
        const username = process.env.MONGO_USERNAME;
        const password = process.env.MONGO_PASSWORD;
        const dbName = process.env.MONGO_DB || 'shadi_pk';

        await mongoose.connect(`mongodb://${ATLAS_HOSTS}/${dbName}`, {
            auth: { username, password },
            tls: true, authSource: 'admin',
            replicaSet: 'atlas-f19au4-shard-0',
            serverSelectionTimeoutMS: 15000, family: 4,
            maxPoolSize: 1, minPoolSize: 1, maxConnecting: 1,
        });
        console.log('Connected to DB');

        // Delete existing test profiles
        await User.deleteMany({ email: { $in: profiles.map((p) => p.email) } });

        // Create each profile (triggers pre-save password hash)
        let created = 0;
        for (const p of profiles) {
            await User.create(p);
            created++;
            process.stdout.write(`\r✅ Created ${created}/${profiles.length}: ${p.name}`);
        }

        console.log('\n\n🎉 All dummy profiles created!');
        console.log(`Total: ${profiles.length} profiles (${profiles.filter(p => p.gender === 'male').length} male, ${profiles.filter(p => p.gender === 'female').length} female)`);
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Error:', err.message);
        process.exit(1);
    }
};

seedProfiles();
