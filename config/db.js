const mongoose = require('mongoose');

const connectDB = async () => {
  // Database connect na hone par queries latakne ke bajaye foran fail hon
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
    console.log(`MongoDB connection notice: ${error.message}`);
  }
};

module.exports = connectDB;