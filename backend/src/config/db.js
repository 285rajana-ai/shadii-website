const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    // Attempt connection but don't crash if it fails (using mock mode for dev)
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB Error: ${error.message}. Running in Mock Mode.`);
    // We don't exit(1) here so the server stays up for UI testing
  }
};

module.exports = connectDB;
