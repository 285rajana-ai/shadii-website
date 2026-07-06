const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');

const dbName = process.env.MONGO_DB || 'shadi_pk';
const username = encodeURIComponent(process.env.MONGO_USERNAME);
const password = encodeURIComponent(process.env.MONGO_PASSWORD);
const mongoUri = `mongodb+srv://${username}:${password}@cluster0.nq4a2dl.mongodb.net/${dbName}?retryWrites=true&w=majority`;

const adminAccounts = [
  {
    email: 'admin@shadii.pk',
    name: 'Primary Admin',
    role: 'admin',
    phone: '+923001000001',
  },
  {
    email: 'cacc@shadii.pk',
    name: 'Content Control Desk',
    role: 'cacc',
    phone: '+923001000002',
  },
  {
    email: 'fasm@shadii.pk',
    name: 'Finance Desk',
    role: 'fasm',
    phone: '+923001000003',
  },
  {
    email: 'superadmin@shadii.pk',
    name: 'Executive Super Admin',
    role: 'superadmin',
    phone: '+923001000004',
  }
];

const seedAdmins = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('✅ Connected to MongoDB.');

    for (const acc of adminAccounts) {
      const exists = await User.findOne({ email: acc.email });
      if (exists) {
        console.log(`⚠️ User ${acc.email} already exists. Updating role to ${acc.role}...`);
        exists.role = acc.role;
        exists.isAdmin = true;
        exists.name = acc.name;
        exists.phone = acc.phone;
        await exists.save();
      } else {
        console.log(`🆕 Creating ${acc.role} user: ${acc.email}...`);
        // We set plain password, User pre-save hook will hash it automatically!
        await User.create({
          gender: 'male',
          name: acc.name,
          email: acc.email,
          phone: acc.phone,
          password: 'Admin123!',
          age: 30,
          city: 'Lahore',
          education: 'Masters',
          isVerified: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          verificationStatus: 'approved',
          role: acc.role,
          isAdmin: true,
          profileCompleteness: 100,
          subscription: {
            plan: 'premium',
            isActive: true,
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          }
        });
      }
    }

    console.log('✅ Admin accounts seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedAdmins();
