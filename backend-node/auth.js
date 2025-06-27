/**
 * Authentication Middleware and Utilities
 * Person Y Guide: This handles JWT token validation and user authentication
 * Person X: This is like a security guard that checks if users are allowed to access routes
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('./models');

/**
 * Person Y Tip: Always hash passwords before storing in database
 * This function takes a plain text password and returns a secure hash
 */
const hashPassword = async (password) => {
  const saltRounds = 12; // Person Y: Higher salt rounds = more secure but slower
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare a plain text password with a hashed password
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate JWT token for authenticated users
 * Person X: JWT tokens are like temporary ID cards that expire
 */
const generateToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET || 'fallback-jwt-secret-change-in-production';
  return jwt.sign(
    { userId },
    jwtSecret,
    { expiresIn: '24h' } // Person Y: Tokens expire in 24 hours for security
  );
};

/**
 * Middleware to verify JWT token on protected routes
 * Person Y Tip: This runs before any protected API endpoint
 */
const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    // Verify token with fallback secret
    const jwtSecret = process.env.JWT_SECRET || 'fallback-jwt-secret-change-in-production';
    const decoded = jwt.verify(token, jwtSecret);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Add user to request object for use in route handlers
    req.user = user;
    next();

  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

/**
 * Middleware to check if user has specific role
 * Person Y: Role-based access control for different user types
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Convert single role to array for consistency
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions.'
      });
    }

    next();
  };
};

/**
 * Person X: Export all functions so other files can use them
 */
module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  requireRole
};