const mongoose = require('mongoose');
const dns = require('dns');

// Fix Windows DNS queryTxt ETIMEOUT issue for mongodb+srv://
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']); // 👈 Google & Cloudflare Public DNS
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (err) {
  console.warn('DNS server configuration warning:', err.message);
}

const connectDB = async () => {
  mongoose.set('bufferCommands', false);

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.log('MongoDB: No MONGO_URI specified. Running in offline/mock mode.');
    return;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('MongoDB Connected Successfully...');
  } catch (error) {
    console.log(`MongoDB connection notice: ${error.message}. Running in offline fallback mode.`);
  }
};

module.exports = connectDB;