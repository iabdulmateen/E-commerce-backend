const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const createCorrectAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopco');
    console.log('Connected to DB...');

    const admin = new User({
      name: 'Hanzala shah',
      email: 'admin@shopco.com',
      password: 'Admin123', // Yeh script khud bcrypt hash kar degi model ke pre('save') hook se
      role: 'admin'
    });

    await admin.save();
    console.log('Admin created successfully with hashed password!');
    process.exit();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

createCorrectAdmin();