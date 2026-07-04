/**
 * @file controllers/userController.js
 * @description User/candidate profile management and analytics controller.
 */

const User = require('../models/User');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');
const { getJobRecommendations } = require('../utils/aiMatcher');

// ─── Get Profile ──────────────────────────────────────────────────────────────

/**
 * GET /api/users/profile
 * @desc Get the authenticated user's profile
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('company');
  return successResponse(res, 200, 'Profile retrieved.', user);
});

// ─── Update Profile ───────────────────────────────────────────────────────────

/**
 * PUT /api/users/profile
 * @desc Update candidate profile fields
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'profile'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).populate('company');

  return successResponse(res, 200, 'Profile updated successfully.', user);
});

// ─── Upload Avatar ────────────────────────────────────────────────────────────

/**
 * PUT /api/users/profile/avatar
 * @desc Upload or update profile picture
 */
exports.uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 400, 'Please provide an image file.');
  }

  const avatarUrl = req.file.path || req.file.secure_url || `/uploads/images/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: avatarUrl },
    { new: true }
  );

  return successResponse(res, 200, 'Avatar updated successfully.', { avatar: user.avatar });
});

// ─── Upload Resume ────────────────────────────────────────────────────────────

/**
 * PUT /api/users/profile/resume
 * @desc Upload or update resume PDF
 */
exports.uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 400, 'Please provide a PDF file.');
  }

  const resumeUrl = req.file.path || req.file.secure_url || `/uploads/resumes/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      'profile.resume': resumeUrl,
      'profile.resumeOriginalName': req.file.originalname,
    },
    { new: true }
  );

  return successResponse(res, 200, 'Resume uploaded successfully.', {
    resume: user.profile.resume,
    resumeOriginalName: user.profile.resumeOriginalName,
  });
});

// ─── Candidate Dashboard Analytics ───────────────────────────────────────────

/**
 * GET /api/users/dashboard/candidate
 * @desc Get candidate's analytics data
 */
exports.getCandidateDashboard = asyncHandler(async (req, res) => {
  const candidateId = req.user._id;

  // Total applications and status breakdown
  const [statusBreakdown, totalApplications, monthlyApplications] = await Promise.all([
    Application.aggregate([
      { $match: { candidate: candidateId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Application.countDocuments({ candidate: candidateId }),
    Application.aggregate([
      { $match: { candidate: candidateId } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
  ]);

  const accepted = statusBreakdown.find((s) => s._id === 'accepted')?.count || 0;
  const successRate = totalApplications > 0 ? Math.round((accepted / totalApplications) * 100) : 0;

  // Calculate resume score based on profile completeness
  const user = await User.findById(candidateId);
  const resumeScore = calculateResumeScore(user);

  // Recent applications
  const recentApplications = await Application.find({ candidate: candidateId })
    .populate('job', 'title location jobType salary')
    .populate({ path: 'job', populate: { path: 'company', select: 'name logo' } })
    .sort({ createdAt: -1 })
    .limit(5);

  return successResponse(res, 200, 'Dashboard data retrieved.', {
    stats: {
      totalApplications,
      successRate,
      resumeScore,
      interviewsScheduled: statusBreakdown.find((s) => s._id === 'interviewing')?.count || 0,
    },
    statusBreakdown: statusBreakdown.reduce((acc, s) => {
      acc[s._id] = s.count;
      return acc;
    }, {}),
    monthlyApplications,
    recentApplications,
  });
});

// ─── Job Recommendations ──────────────────────────────────────────────────────

/**
 * GET /api/users/recommendations
 * @desc Get AI-powered job recommendations for the candidate
 */
exports.getRecommendations = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const jobs = await Job.find({ status: 'open' })
    .populate('company', 'name logo location industry')
    .lean();

  const recommendations = getJobRecommendations(user, jobs, 10);

  return successResponse(res, 200, 'Recommendations retrieved.', recommendations);
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Calculate profile completeness score (0-100).
 * @param {Object} user - User document
 * @returns {number} Resume score
 */
const calculateResumeScore = (user) => {
  let score = 0;
  const p = user.profile || {};

  if (user.avatar) score += 10;
  if (p.resume) score += 20;
  if (p.bio) score += 10;
  if (p.skills?.length > 0) score += 15;
  if (p.experience?.length > 0) score += 20;
  if (p.education?.length > 0) score += 15;
  if (p.certifications?.length > 0) score += 5;
  if (p.socialLinks?.length > 0) score += 5;

  return score;
};
