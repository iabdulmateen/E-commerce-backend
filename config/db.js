const mongoose = require('mongoose');

const connectDB = async () => {
  // Fail fast if database is offline rather than buffering operations indefinitely
  mongoose.set('bufferCommands', false);

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.log('MongoDB: No MONGO_URI specified. Running in offline/mock mode.');
    return;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log('MongoDB Connected Successfully...');
  } catch (error) {
    console.log(`MongoDB connection notice: ${error.message}. Running in offline fallback mode.`);
  }
};

module.exports = connectDB;