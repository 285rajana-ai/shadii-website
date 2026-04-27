const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');

const seedUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await User.deleteMany({ email: 'test@shadii.pk' });
    
    await User.create({
      name: 'Test User',
      email: 'test@shadii.pk',
      password: hashedPassword,
      gender: 'Male',
      age: 28,
      city: 'Lahore',
      isVerified: true
    });

    console.log('✅ Test user created: test@shadii.pk / password123');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedUser();
