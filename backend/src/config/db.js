const mongoose = require('mongoose');
// Allow database queries to be queued during connection initialization
mongoose.set('bufferCommands', true);

const connectDB = async () => {
  const username = process.env.MONGO_USERNAME;
  const password = process.env.MONGO_PASSWORD;
  const dbName = process.env.MONGO_DB || 'shadi_pk';

  if (!username || !password) {
    console.error('❌ MONGO_USERNAME or MONGO_PASSWORD not set. Cannot connect to database.');
    process.exit(1);
  }

  // URL encode credentials to handle special characters (e.g. '@', '%') correctly
  const encodedUser = encodeURIComponent(username);
  const encodedPass = encodeURIComponent(password);
  
  const mongoUri = `mongodb+srv://${encodedUser}:${encodedPass}@cluster0.nq4a2dl.mongodb.net/${dbName}?retryWrites=true&w=majority`;

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
