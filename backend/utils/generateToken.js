/**
 * @file utils/generateToken.js
 * @description JWT token generation and cookie-setting utilities.
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generate a JWT token for a user.
 * @param {string} userId - User's MongoDB ObjectId
 * @param {string} role - User's role
 * @returns {string} Signed JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Set JWT as an HTTP-only cookie and return the token.
 * @param {Object} res - Express response object
 * @param {string} userId - User's MongoDB ObjectId
 * @param {string} role - User's role
 * @returns {string} The generated JWT token
 */
const sendTokenResponse = (res, userId, role) => {
  const token = generateToken(userId, role);

  const options = {
    expires: new Date(
      Date.now() + (parseInt(process.env.COOKIE_EXPIRE) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('token', token, options);
  return token;
};

/**
 * Generate a cryptographically secure random token (for email verification / password reset).
 * @returns {string} Hex-encoded random token
 */
const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = { generateToken, sendTokenResponse, generateSecureToken };
