require('dotenv').config();

const dns = require('dns');
// Use public DNS to prevent querySrv ECONNREFUSED issues on local ISP/Windows DNS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // fallback if permissions restrict custom DNS
}

const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI?.trim();

  if (!mongoURI) {
    console.error(
      'MongoDB connection error: MONGO_URI is not defined. Set it in your .env file.'
    );
    process.exit(1);
  }

  if (!/^mongodb(\+srv)?:\/\//.test(mongoURI)) {
    console.error(
      'MongoDB connection error: MONGO_URI must start with "mongodb://" or "mongodb+srv://"'
    );
    console.error(
      'Copy .env.example to .env, add your connection string, then restart the server.'
    );
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
