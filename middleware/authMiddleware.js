
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return secret;
};

const generateToken = (id) => {
  return jwt.sign(
    { id },
    getJwtSecret(),
    { expiresIn: '30d' }
  );
};

const getAuthenticatedUser = async (token) => {
  const decoded = jwt.verify(token, getJwtSecret());

  if (!User.db || User.db.readyState !== 1) {
    const error = new Error('Database unavailable');
    error.statusCode = 503;
    throw error;
  }

  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 401;
    throw error;
  }

  return user;
};

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Not authorized, no valid token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Not authorized, no token provided'
      });
    }

    req.user = await getAuthenticatedUser(token);

    next();
  } catch (error) {
    return res.status(error.statusCode || 401).json({
      error: error.statusCode === 503
        ? 'Database service unavailable'
        : 'Not authorized, token invalid or expired'
    });
  }
};

const optionalProtect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Invalid authorization header'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Invalid token'
      });
    }

    req.user = await getAuthenticatedUser(token);

    next();
  } catch (error) {
    return res.status(error.statusCode || 401).json({
      error: error.statusCode === 503
        ? 'Database service unavailable'
        : 'Not authorized, token invalid or expired'
    });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    error: 'Not authorized as an admin'
  });
};

module.exports = {
  generateToken,
  protect,
  optionalProtect,
  admin
};
