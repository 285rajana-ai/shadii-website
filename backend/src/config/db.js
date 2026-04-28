const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);

// Atlas replica set hosts
const ATLAS_HOSTS = [
  'ac-b7nm95o-shard-00-00.nq4a2dl.mongodb.net:27017',
  'ac-b7nm95o-shard-00-01.nq4a2dl.mongodb.net:27017',
  'ac-b7nm95o-shard-00-02.nq4a2dl.mongodb.net:27017',
].join(',');

const connectDB = async () => {
  const username = process.env.MONGO_USERNAME;
  const password = process.env.MONGO_PASSWORD;
  const dbName = process.env.MONGO_DB || 'shadi_pk';

  if (!username || !password) {
    console.error('❌ MONGO_USERNAME or MONGO_PASSWORD not set. Cannot connect to database.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(
      `mongodb://${ATLAS_HOSTS}/${dbName}`,
      {
        auth: { username, password },
        tls: true,
        authSource: 'admin',
        replicaSet: 'atlas-f19au4-shard-0',
        retryWrites: true,
        serverSelectionTimeoutMS: 15000,
        family: 4,
        maxPoolSize: 10,
        minPoolSize: 1,
        maxConnecting: 1,
      }
    );
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
