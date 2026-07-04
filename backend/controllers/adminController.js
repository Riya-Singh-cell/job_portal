/**
 * @file controllers/adminController.js
 * @description Admin panel controller for system management and analytics.
 */

const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Company = require('../models/Company');
const Report = require('../models/Report');
const { successResponse, errorResponse, buildPagination } = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

/**
 * GET /api/admin/dashboard
 * @desc Get system-wide analytics for admin dashboard
 */
exports.getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalJobs,
    totalApplications,
    totalCompanies,
    openJobs,
    usersByRole,
    applicationsByStatus,
    monthlyUsers,
    monthlyJobs,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
    Company.countDocuments(),
    Job.countDocuments({ status: 'open' }),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    User.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
    Job.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
    User.find().select('name email role avatar createdAt status').sort({ createdAt: -1 }).limit(10),
  ]);

  return successResponse(res, 200, 'Dashboard data retrieved.', {
    stats: {
      totalUsers,
      totalJobs,
      totalApplications,
      totalCompanies,
      openJobs,
    },
    usersByRole: usersByRole.reduce((acc, r) => { acc[r._id] = r.count; return acc; }, {}),
    applicationsByStatus: applicationsByStatus.reduce((acc, a) => { acc[a._id] = a.count; return acc; }, {}),
    monthlyUsers,
    monthlyJobs,
    recentUsers,
  });
});

// ─── Manage Users ─────────────────────────────────────────────────────────────

/**
 * GET /api/admin/users
 * @desc Get all users with search, filter, pagination
 */
exports.getUsers = asyncHandler(async (req, res) => {
  const { search, role, status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) query.role = role;
  if (status) query.status = status;

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .populate('company', 'name logo')
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  return successResponse(
    res,
    200,
    'Users retrieved.',
    users,
    buildPagination(parseInt(page), parseInt(limit), total)
  );
});

/**
 * PATCH /api/admin/users/:id/status
 * @desc Suspend or activate a user account
 */
exports.updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['active', 'suspended'].includes(status)) {
    return errorResponse(res, 400, 'Invalid status. Use "active" or "suspended".');
  }

  const user = await User.findById(req.params.id);
  if (!user) return errorResponse(res, 404, 'User not found.');

  if (user.role === 'admin') {
    return errorResponse(res, 403, 'Cannot modify admin accounts.');
  }

  user.status = status;
  await user.save();

  return successResponse(res, 200, `User ${status === 'active' ? 'activated' : 'suspended'} successfully.`, {
    id: user._id,
    status: user.status,
  });
});

// ─── Manage Jobs ──────────────────────────────────────────────────────────────

/**
 * GET /api/admin/jobs
 * @desc Get all jobs for admin moderation
 */
exports.getJobs = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (status) query.status = status;

  const total = await Job.countDocuments(query);
  const jobs = await Job.find(query)
    .populate('company', 'name logo')
    .populate('recruiter', 'name email')
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  return successResponse(
    res,
    200,
    'Jobs retrieved.',
    jobs,
    buildPagination(parseInt(page), parseInt(limit), total)
  );
});

// ─── Recruiter Analytics ──────────────────────────────────────────────────────

/**
 * GET /api/admin/recruiter/:id/analytics
 * @desc Get analytics for a specific recruiter
 */
exports.getRecruiterAnalytics = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [totalJobs, openJobs, totalApplications, hiringFunnel] = await Promise.all([
    Job.countDocuments({ recruiter: id }),
    Job.countDocuments({ recruiter: id, status: 'open' }),
    Application.countDocuments({
      job: { $in: await Job.find({ recruiter: id }).select('_id') },
    }),
    Application.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'jobData',
        },
      },
      { $unwind: '$jobData' },
      { $match: { 'jobData.recruiter': require('mongoose').Types.ObjectId.createFromHexString(id) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  return successResponse(res, 200, 'Recruiter analytics retrieved.', {
    totalJobs,
    openJobs,
    closedJobs: totalJobs - openJobs,
    totalApplications,
    hiringFunnel: hiringFunnel.reduce((acc, h) => { acc[h._id] = h.count; return acc; }, {}),
  });
});

// ─── Reports ──────────────────────────────────────────────────────────────────

/**
 * POST /api/admin/reports
 * @desc Create a report
 */
exports.createReport = asyncHandler(async (req, res) => {
  const { targetType, targetId, reason } = req.body;

  if (!targetType || !targetId || !reason) {
    return errorResponse(res, 400, 'Target type, target ID and reason are required.');
  }

  const report = await Report.create({
    reporter: req.user._id,
    targetType,
    targetId,
    reason,
  });

  return successResponse(res, 201, 'Report submitted.', report);
});

/**
 * GET /api/admin/reports
 * @desc Get all reports (admin only)
 */
exports.getReports = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;

  const total = await Report.countDocuments(query);
  const reports = await Report.find(query)
    .populate('reporter', 'name email')
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  return successResponse(
    res,
    200,
    'Reports retrieved.',
    reports,
    buildPagination(parseInt(page), parseInt(limit), total)
  );
});

/**
 * PATCH /api/admin/reports/:id/status
 * @desc Update report status
 */
exports.updateReportStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'reviewed', 'resolved'];

  if (!validStatuses.includes(status)) {
    return errorResponse(res, 400, 'Invalid status.');
  }

  const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!report) return errorResponse(res, 404, 'Report not found.');

  return successResponse(res, 200, 'Report status updated.', report);
});
