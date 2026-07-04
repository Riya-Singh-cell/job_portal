/**
 * @file controllers/savedJobController.js
 * @description Saved/bookmarked jobs controller for candidates.
 */

const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');
const { successResponse, errorResponse, buildPagination } = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * POST /api/saved-jobs/:jobId
 * @desc Toggle save/unsave a job
 */
exports.toggleSaveJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) return errorResponse(res, 404, 'Job not found.');

  const existing = await SavedJob.findOne({ user: req.user._id, job: jobId });

  if (existing) {
    await existing.deleteOne();
    return successResponse(res, 200, 'Job removed from saved jobs.', { saved: false });
  }

  await SavedJob.create({ user: req.user._id, job: jobId });
  return successResponse(res, 201, 'Job saved successfully.', { saved: true });
});

/**
 * GET /api/saved-jobs
 * @desc Get all saved jobs for the authenticated user
 */
exports.getSavedJobs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const total = await SavedJob.countDocuments({ user: req.user._id });
  const savedJobs = await SavedJob.find({ user: req.user._id })
    .populate({
      path: 'job',
      populate: { path: 'company', select: 'name logo location' },
    })
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  return successResponse(
    res,
    200,
    'Saved jobs retrieved.',
    savedJobs,
    buildPagination(parseInt(page), parseInt(limit), total)
  );
});
