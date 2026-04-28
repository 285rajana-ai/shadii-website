const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');

const ATLAS_HOSTS = [
  'ac-b7nm95o-shard-00-00.nq4a2dl.mongodb.net:27017',
  'ac-b7nm95o-shard-00-01.nq4a2dl.mongodb.net:27017',
  'ac-b7nm95o-shard-00-02.nq4a2dl.mongodb.net:27017',
].join(',');

const demoUsers = [
  {
    gender: 'male',
    name: 'Shadii Admin',
    email: 'admin@shadii.pk',
    phone: '+923000000001',
    password: 'ShadiiAdmin@2026',
    age: 32,
    city: 'Lahore',
    education: 'Masters',
    isVerified: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    verificationStatus: 'approved',
    isAdmin: true,
    profileCompleteness: 100,
    subscription: {
      plan: 'premium',
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  },
  {
    gender: 'female',
    name: 'Shadii Demo User',
    email: 'user@shadii.pk',
    phone: '+923000000002',
    password: 'ShadiiUser@2026',
    age: 26,
    city: 'Islamabad',
    education: 'Bachelors',
    isVerified: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    verificationStatus: 'approved',
    profileCompleteness: 92,
    subscription: {
      plan: 'premium',
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    },
  },
];

const seedUsers = async () => {
  try {
    const username = process.env.MONGO_USERNAME;
    const password = process.env.MONGO_PASSWORD;
    const dbName = process.env.MONGO_DB || 'shadi_pk';

    await mongoose.connect(`mongodb://${ATLAS_HOSTS}/${dbName}`, {
      auth: { username, password },
      tls: true,
      authSource: 'admin',
      replicaSet: 'atlas-f19au4-shard-0',
      retryWrites: true,
      serverSelectionTimeoutMS: 15000,
      family: 4,
      maxPoolSize: 1,
      minPoolSize: 1,
      maxConnecting: 1,
    });
    console.log('Connected to DB');

    await User.deleteMany({
      email: { $in: demoUsers.map((user) => user.email) },
    });

    await User.create(demoUsers);

    console.log('✅ Demo admin created: admin@shadii.pk / ShadiiAdmin@2026');
    console.log('✅ Demo user created: user@shadii.pk / ShadiiUser@2026');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedUsers();
