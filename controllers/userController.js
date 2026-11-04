
const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');

// Check database connection
const checkDatabase = (res) => {
  if (!User.db || User.db.readyState !== 1) {
    res.status(503).json({
      error: 'Database service unavailable. Please try again later.'
    });
    return false;
  }

  return true;
};

// @desc Register a new customer
// @route POST /api/users/register
// @access Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        error: 'Please provide valid name, email, and password'
      });
    }

    if (!checkDatabase(res)) return;

    const normalizedEmail = email.toLowerCase().trim();

    const userExists = await User.findOne({
      email: normalizedEmail
    });

    if (userExists) {
      return res.status(409).json({
        error: 'User already exists with this email'
      });
    }

    // Public registration always creates a customer.
    // Never accept admin role from request body.
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      message: 'User registered successfully'
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'User already exists with this email'
      });
    }

    next(error);
  }
};

// @desc Authenticate user and get token
// @route POST /api/users/login
// @access Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        error: 'Please provide email and password'
      });
    }

    if (!checkDatabase(res)) return;

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      message: 'Login successful'
    });

  } catch (error) {
    next(error);
  }
};

// @desc Get current user profile
// @route GET /api/users/profile
// @access Private
const getUserProfile = async (req, res, next) => {
  try {
    return res.json(req.user);
  } catch (error) {
    next(error);
  }
};

// @desc Get all users
// @route GET /api/users
// @access Private/Admin
const getUsers = async (req, res, next) => {
  try {
    if (!checkDatabase(res)) return;

    const users = await User.find({}).select('-password');

    return res.json(users);

  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getUsers
};
