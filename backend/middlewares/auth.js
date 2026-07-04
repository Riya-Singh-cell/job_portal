/**
 * @file middlewares/auth.js
 * @description JWT authentication and role-based authorization middleware.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Protect routes — verifies JWT from cookie or Authorization header.
 * Attaches the authenticated user to req.user.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check cookie first, then Authorization header
    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 401, 'Access denied. Please log in.');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user and ensure account is active
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return errorResponse(res, 401, 'User no longer exists.');
    }

    if (user.status === 'suspended') {
      return errorResponse(res, 403, 'Your account has been suspended. Contact support.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 401, 'Invalid token.');
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Token expired. Please log in again.');
    }
    return errorResponse(res, 500, 'Authentication error.');
  }
};

/**
 * Restrict access to specific roles.
 * @param {...string} roles - Allowed roles
 * @returns Express middleware
 *
 * @example
 * router.get('/admin', protect, authorize('admin'), adminController.dashboard);
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Not authenticated.');
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Role '${req.user.role}' is not authorized to access this resource.`
      );
    }

    next();
  };
};

/**
 * Optional authentication — attaches user if token present, otherwise continues.
 * Useful for endpoints that behave differently for authenticated users.
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.status === 'active') {
        req.user = user;
      }
    }
  } catch {
    // Silently ignore invalid tokens for optional auth
  }

  next();
};

module.exports = { protect, authorize, optionalAuth };
