/**
 * @file controllers/authController.js
 * @description Authentication controller — register, login, logout,
 * email verification, forgot/reset password.
 */

const crypto = require('crypto');
const User = require('../models/User');
const { sendTokenResponse, generateSecureToken } = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require('../services/emailService');
const { asyncHandler } = require('../middlewares/errorHandler');

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * @desc Register a new user and send verification email
 */
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return errorResponse(res, 400, 'Please provide name, email and password.');
  }

  // Only allow valid roles through the public API
  const allowedRoles = ['candidate', 'recruiter'];
  const userRole = allowedRoles.includes(role) ? role : 'candidate';

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return errorResponse(res, 409, 'An account with this email already exists.');
  }

  const verificationToken = generateSecureToken();

  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
    verificationToken,
  });

  // Send verification email
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  await sendVerificationEmail(user, verificationUrl);

  const token = sendTokenResponse(res, user._id, user.role);

  return successResponse(res, 201, 'Registration successful. Please verify your email.', {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar,
    },
  });
});

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * @desc Authenticate user and return JWT token
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 400, 'Please provide email and password.');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return errorResponse(res, 401, 'Invalid email or password.');
  }

  if (user.status === 'suspended') {
    return errorResponse(res, 403, 'Your account has been suspended. Contact support.');
  }

  const token = sendTokenResponse(res, user._id, user.role);

  return successResponse(res, 200, 'Login successful.', {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar,
      company: user.company,
    },
  });
});

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/logout
 * @desc Clear auth cookie
 */
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  return successResponse(res, 200, 'Logged out successfully.');
});

// ─── Get Current User ─────────────────────────────────────────────────────────

/**
 * GET /api/auth/me
 * @desc Return the currently authenticated user
 */
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('company');
  return successResponse(res, 200, 'User retrieved.', user);
});

// ─── Verify Email ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/verify-email/:token
 * @desc Verify user's email address
 */
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({ verificationToken: token });

  if (!user) {
    return errorResponse(res, 400, 'Invalid or expired verification token.');
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  return successResponse(res, 200, 'Email verified successfully. You can now log in.');
});

// ─── Forgot Password ──────────────────────────────────────────────────────────

/**
 * POST /api/auth/forgot-password
 * @desc Send password reset email
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return errorResponse(res, 400, 'Please provide your email address.');
  }

  const user = await User.findOne({ email });

  if (!user) {
    // Return success even if user not found to prevent email enumeration
    return successResponse(res, 200, 'If that email exists, a reset link has been sent.');
  }

  const resetToken = generateSecureToken();
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  await sendPasswordResetEmail(user, resetUrl);

  return successResponse(res, 200, 'If that email exists, a reset link has been sent.');
});

// ─── Reset Password ───────────────────────────────────────────────────────────

/**
 * POST /api/auth/reset-password/:token
 * @desc Reset user's password using reset token
 */
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return errorResponse(res, 400, 'Password must be at least 6 characters.');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return errorResponse(res, 400, 'Invalid or expired reset token.');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return successResponse(res, 200, 'Password reset successfully. Please log in.');
});
