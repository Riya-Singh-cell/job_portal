/**
 * @file controllers/jobController.js
 * @description Job listing CRUD and advanced search controller.
 */

const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const { successResponse, errorResponse, buildPagination } = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

// ─── Browse Jobs (Public) ─────────────────────────────────────────────────────

/**
 * GET /api/jobs
 * @desc Browse jobs with advanced search, filter, sort, and pagination
 */
exports.getJobs = asyncHandler(async (req, res) => {
  const {
    keyword,
    location,
    jobType,
    experienceLevel,
    minSalary,
    maxSalary,
    company,
    skills,
    status = 'open',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  } = req.query;

  const query = {};

  // Status filter
  if (status) query.status = status;

  // Full-text keyword search
  if (keyword) {
    query.$text = { $search: keyword };
  }

  // Location filter
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  // Job type filter
  if (jobType) {
    query.jobType = { $in: jobType.split(',') };
  }

  // Experience level filter
  if (experienceLevel) {
    query.experienceLevel = { $in: experienceLevel.split(',') };
  }

  // Salary range filter
  if (minSalary || maxSalary) {
    query['salary.min'] = {};
    if (minSalary) query['salary.min'].$gte = parseInt(minSalary);
    if (maxSalary) query['salary.max'] = { $lte: parseInt(maxSalary) };
  }

  // Skills filter (match against requirements)
  if (skills) {
    const skillList = skills.split(',').map((s) => s.trim());
    query.requirements = { $in: skillList.map((s) => new RegExp(s, 'i')) };
  }

  // Company filter
  if (company) {
    query.company = company;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const total = await Job.countDocuments(query);

  const jobs = await Job.find(query)
    .populate('company', 'name logo location industry')
    .populate('recruiter', 'name avatar')
    .sort(sortOptions)
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit))
    .lean();

  // If user is authenticated, mark saved jobs
  if (req.user) {
    const savedJobs = await SavedJob.find({ user: req.user._id }).select('job').lean();
    const savedJobIds = new Set(savedJobs.map((sj) => sj.job.toString()));
    jobs.forEach((job) => {
      job.isSaved = savedJobIds.has(job._id.toString());
    });
  }

  return successResponse(
    res,
    200,
    'Jobs retrieved.',
    jobs,
    buildPagination(parseInt(page), parseInt(limit), total)
  );
});

// ─── Get Single Job ───────────────────────────────────────────────────────────

/**
 * GET /api/jobs/:id
 * @desc Get job by ID and increment view count
 */
exports.getJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate('company', 'name logo location industry website description')
    .populate('recruiter', 'name avatar');

  if (!job) {
    return errorResponse(res, 404, 'Job not found.');
  }

  let isSaved = false;
  let hasApplied = false;

  if (req.user) {
    const [saved, applied] = await Promise.all([
      SavedJob.findOne({ user: req.user._id, job: job._id }),
      Application.findOne({ candidate: req.user._id, job: job._id }),
    ]);
    isSaved = !!saved;
    hasApplied = !!applied;
  }

  return successResponse(res, 200, 'Job retrieved.', { ...job.toObject(), isSaved, hasApplied });
});

// ─── Create Job ───────────────────────────────────────────────────────────────

/**
 * POST /api/jobs
 * @desc Create a new job listing (recruiter only)
 */
exports.createJob = asyncHandler(async (req, res) => {
  const { title, description, requirements, salary, location, jobType, experienceLevel } = req.body;

  if (!req.user.company) {
    return errorResponse(res, 400, 'You must create a company profile before posting jobs.');
  }

  if (!title || !description || !location) {
    return errorResponse(res, 400, 'Title, description and location are required.');
  }

  const job = await Job.create({
    title,
    description,
    requirements: Array.isArray(requirements) ? requirements : [requirements],
    salary,
    location,
    jobType,
    experienceLevel,
    company: req.user.company,
    recruiter: req.user._id,
  });

  const populatedJob = await Job.findById(job._id).populate('company', 'name logo');

  return successResponse(res, 201, 'Job created successfully.', populatedJob);
});

// ─── Update Job ───────────────────────────────────────────────────────────────

/**
 * PUT /api/jobs/:id
 * @desc Update a job listing
 */
exports.updateJob = asyncHandler(async (req, res) => {
  let job = await Job.findById(req.params.id);

  if (!job) {
    return errorResponse(res, 404, 'Job not found.');
  }

  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Not authorized to update this job.');
  }

  job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('company', 'name logo');

  return successResponse(res, 200, 'Job updated successfully.', job);
});

// ─── Delete Job ───────────────────────────────────────────────────────────────

/**
 * DELETE /api/jobs/:id
 * @desc Delete a job listing
 */
exports.deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return errorResponse(res, 404, 'Job not found.');
  }

  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Not authorized to delete this job.');
  }

  await job.deleteOne();

  // Also delete associated applications and saved jobs
  await Promise.all([
    Application.deleteMany({ job: req.params.id }),
    SavedJob.deleteMany({ job: req.params.id }),
  ]);

  return successResponse(res, 200, 'Job deleted successfully.');
});

// ─── Duplicate Job ────────────────────────────────────────────────────────────

/**
 * POST /api/jobs/:id/duplicate
 * @desc Duplicate a job listing
 */
exports.duplicateJob = asyncHandler(async (req, res) => {
  const originalJob = await Job.findById(req.params.id);

  if (!originalJob) {
    return errorResponse(res, 404, 'Job not found.');
  }

  if (originalJob.recruiter.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'Not authorized.');
  }

  const { _id, views, applicationsCount, createdAt, updatedAt, __v, ...jobData } = originalJob.toObject();

  const duplicate = await Job.create({
    ...jobData,
    title: `${originalJob.title} (Copy)`,
    status: 'open',
    views: 0,
    applicationsCount: 0,
  });

  const populatedDuplicate = await Job.findById(duplicate._id).populate('company', 'name logo');

  return successResponse(res, 201, 'Job duplicated successfully.', populatedDuplicate);
});

// ─── Toggle Job Status ────────────────────────────────────────────────────────

/**
 * PATCH /api/jobs/:id/status
 * @desc Toggle job status between open and closed
 */
exports.toggleJobStatus = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return errorResponse(res, 404, 'Job not found.');
  }

  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Not authorized.');
  }

  job.status = job.status === 'open' ? 'closed' : 'open';
  await job.save();

  return successResponse(res, 200, `Job ${job.status === 'open' ? 'opened' : 'closed'} successfully.`, job);
});

// ─── Recruiter's Jobs ─────────────────────────────────────────────────────────

/**
 * GET /api/jobs/recruiter/my-jobs
 * @desc Get all jobs posted by the authenticated recruiter
 */
exports.getMyJobs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { recruiter: req.user._id };
  if (status) query.status = status;

  const total = await Job.countDocuments(query);
  const jobs = await Job.find(query)
    .populate('company', 'name logo')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  return successResponse(
    res,
    200,
    'Your jobs retrieved.',
    jobs,
    buildPagination(parseInt(page), parseInt(limit), total)
  );
});
