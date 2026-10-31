const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// In-memory fallback cache when database connection is not yet configured
const inMemoryUsers = [];

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // If MongoDB is connected
    if (User.db && User.db.readyState === 1) {
      const userExists = await User.findOne({ email: normalizedEmail });
      if (userExists) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      const user = await User.create({
        name,
        email: normalizedEmail,
        password,
        role: role === 'admin' ? 'admin' : 'customer',
      });

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        message: 'User registered successfully',
      });
    }

    // Fallback in-memory mode (if database is offline)
    const existing = inMemoryUsers.find((u) => u.email === normalizedEmail);
    if (existing) {
      return res.status(400).json({ error: 'User already exists (in-memory)' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const mockUser = {
      _id: 'mock_user_' + Date.now(),
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'customer',
      createdAt: new Date(),
    };
    inMemoryUsers.push(mockUser);

    return res.status(201).json({
      _id: mockUser._id,
      name: mockUser.name,
      email: mockUser.email,
      role: mockUser.role,
      token: generateToken(mockUser._id),
      message: 'User registered successfully (offline store)',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // If MongoDB is connected
    if (User.db && User.db.readyState === 1) {
      const user = await User.findOne({ email: normalizedEmail });

      if (user && (await user.matchPassword(password))) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
          message: 'Login successful',
        });
      }
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Fallback in-memory mode
    const mockUser = inMemoryUsers.find((u) => u.email === normalizedEmail);
    if (mockUser && (await bcrypt.compare(password, mockUser.password))) {
      return res.json({
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        token: generateToken(mockUser._id),
        message: 'Login successful (offline store)',
      });
    }

    return res.status(401).json({ error: 'Invalid email or password' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    if (User.db && User.db.readyState === 1) {
      const user = await User.findById(req.user._id).select('-password');
      if (user) {
        return res.json(user);
      }
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(req.user);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    if (User.db && User.db.readyState === 1) {
      const users = await User.find({}).select('-password');
      return res.json(users);
    }
    return res.json(inMemoryUsers.map(({ password, ...u }) => u));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getUsers,
};
