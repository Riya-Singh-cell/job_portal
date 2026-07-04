/**
 * @file controllers/applicationController.js
 * @description Application management controller for candidates and recruiters.
 */

const Application = require('../models/Application');
const Job = require('../models/Job');
const Interview = require('../models/Interview');
const Notification = require('../models/Notification');
const { successResponse, errorResponse, buildPagination } = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');
const { calculateMatchScore } = require('../utils/aiMatcher');
const {
  sendApplicationConfirmation,
  sendStatusUpdateEmail,
  sendInterviewNotification,
} = require('../services/emailService');
const User = require('../models/User');

// ─── Apply to Job ─────────────────────────────────────────────────────────────

/**
 * POST /api/applications/:jobId
 * @desc Apply to a job
 */
exports.applyToJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { coverLetter } = req.body;

  if (req.user.role !== 'candidate') {
    return errorResponse(res, 403, 'Only candidates can apply to jobs.');
  }

  const job = await Job.findById(jobId).populate('company');
  if (!job) return errorResponse(res, 404, 'Job not found.');
  if (job.status !== 'open') return errorResponse(res, 400, 'This job is no longer accepting applications.');

  const existing = await Application.findOne({ job: jobId, candidate: req.user._id });
  if (existing) return errorResponse(res, 409, 'You have already applied to this job.');

  const candidate = await User.findById(req.user._id);

  // Use uploaded resume or profile resume
  const resumeUrl = req.file
    ? req.file.path || req.file.secure_url || `/uploads/resumes/${req.file.filename}`
    : candidate.profile?.resume;

  if (!resumeUrl) {
    return errorResponse(res, 400, 'Please upload a resume to apply.');
  }

  // Calculate AI match score
  const aiMatchScore = calculateMatchScore(candidate, job);

  const application = await Application.create({
    job: jobId,
    candidate: req.user._id,
    resume: resumeUrl,
    coverLetter,
    aiMatchScore,
    timeline: [{ status: 'pending', date: new Date(), comment: 'Application submitted' }],
  });

  // Increment job application count
  await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

  // Create notification for recruiter
  await Notification.create({
    recipient: job.recruiter,
    sender: req.user._id,
    type: 'application_status',
    title: 'New Application Received',
    message: `${candidate.name} applied to ${job.title}`,
    link: `/recruiter/applications/${application._id}`,
  });

  // Send confirmation email to candidate
  await sendApplicationConfirmation(candidate, job, job.company);

  const populatedApp = await Application.findById(application._id)
    .populate('job', 'title location company')
    .populate({ path: 'job', populate: { path: 'company', select: 'name logo' } });

  return successResponse(res, 201, 'Application submitted successfully.', populatedApp);
});

// ─── Get My Applications ──────────────────────────────────────────────────────

/**
 * GET /api/applications/my-applications
 * @desc Get all applications for the authenticated candidate
 */
exports.getMyApplications = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { candidate: req.user._id };
  if (status) query.status = status;

  const total = await Application.countDocuments(query);
  const applications = await Application.find(query)
    .populate({
      path: 'job',
      select: 'title location jobType salary status',
      populate: { path: 'company', select: 'name logo' },
    })
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  return successResponse(
    res,
    200,
    'Applications retrieved.',
    applications,
    buildPagination(parseInt(page), parseInt(limit), total)
  );
});

// ─── Withdraw Application ─────────────────────────────────────────────────────

/**
 * DELETE /api/applications/:id/withdraw
 * @desc Withdraw/delete an application
 */
exports.withdrawApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) return errorResponse(res, 404, 'Application not found.');
  if (application.candidate.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'Not authorized to withdraw this application.');
  }

  if (['accepted', 'rejected'].includes(application.status)) {
    return errorResponse(res, 400, 'Cannot withdraw a finalized application.');
  }

  await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });
  await application.deleteOne();

  return successResponse(res, 200, 'Application withdrawn successfully.');
});

// ─── Get Job Applications (Recruiter) ────────────────────────────────────────

/**
 * GET /api/applications/job/:jobId
 * @desc Get all applications for a job (recruiter view)
 */
exports.getJobApplications = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { status, minScore, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const job = await Job.findById(jobId);
  if (!job) return errorResponse(res, 404, 'Job not found.');

  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Not authorized to view these applications.');
  }

  const query = { job: jobId };
  if (status) query.status = status;
  if (minScore) query.aiMatchScore = { $gte: parseInt(minScore) };

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const total = await Application.countDocuments(query);
  const applications = await Application.find(query)
    .populate('candidate', 'name email avatar profile.skills profile.experience profile.resume profile.bio')
    .sort(sortOptions)
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  return successResponse(
    res,
    200,
    'Applications retrieved.',
    applications,
    buildPagination(parseInt(page), parseInt(limit), total)
  );
});

// ─── Update Application Status ────────────────────────────────────────────────

/**
 * PATCH /api/applications/:id/status
 * @desc Update application status (recruiter action)
 */
exports.updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, comment } = req.body;

  const allowedStatuses = ['pending', 'shortlisted', 'interviewing', 'accepted', 'rejected'];
  if (!allowedStatuses.includes(status)) {
    return errorResponse(res, 400, 'Invalid status value.');
  }

  const application = await Application.findById(req.params.id)
    .populate('job', 'title recruiter')
    .populate('candidate', 'name email');

  if (!application) return errorResponse(res, 404, 'Application not found.');

  if (
    application.job.recruiter.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return errorResponse(res, 403, 'Not authorized.');
  }

  application.status = status;
  application.timeline.push({ status, date: new Date(), comment: comment || '' });
  await application.save();

  // Notify candidate
  await Notification.create({
    recipient: application.candidate._id,
    type: 'application_status',
    title: 'Application Status Updated',
    message: `Your application for ${application.job.title} is now ${status}`,
    link: `/candidate/applications`,
  });

  // Send email notification
  await sendStatusUpdateEmail(application.candidate, application.job, status);

  return successResponse(res, 200, 'Application status updated.', application);
});

// ─── Schedule Interview ───────────────────────────────────────────────────────

/**
 * POST /api/applications/:id/interview
 * @desc Schedule an interview for a shortlisted candidate
 */
exports.scheduleInterview = asyncHandler(async (req, res) => {
  const { scheduledDate, type, format, meetingLink } = req.body;

  const application = await Application.findById(req.params.id)
    .populate('job', 'title recruiter')
    .populate('candidate', 'name email');

  if (!application) return errorResponse(res, 404, 'Application not found.');

  if (application.job.recruiter.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'Not authorized.');
  }

  if (!scheduledDate) {
    return errorResponse(res, 400, 'Scheduled date is required.');
  }

  const interview = await Interview.create({
    application: application._id,
    job: application.job._id,
    candidate: application.candidate._id,
    recruiter: req.user._id,
    scheduledDate: new Date(scheduledDate),
    type: type || 'Technical',
    format: format || 'Online',
    meetingLink,
  });

  // Update application status
  application.status = 'interviewing';
  application.timeline.push({
    status: 'interviewing',
    date: new Date(),
    comment: `Interview scheduled for ${new Date(scheduledDate).toLocaleString()}`,
  });
  await application.save();

  // Notify candidate
  await Notification.create({
    recipient: application.candidate._id,
    type: 'interview_scheduled',
    title: 'Interview Scheduled',
    message: `Your interview for ${application.job.title} is scheduled for ${new Date(scheduledDate).toLocaleString()}`,
    link: `/candidate/applications`,
  });

  await sendInterviewNotification(application.candidate, interview, application.job);

  return successResponse(res, 201, 'Interview scheduled successfully.', interview);
});

// ─── Get Single Application ───────────────────────────────────────────────────

/**
 * GET /api/applications/:id
 * @desc Get a single application by ID
 */
exports.getApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate({
      path: 'job',
      populate: { path: 'company', select: 'name logo' },
    })
    .populate('candidate', 'name email avatar profile');

  if (!application) return errorResponse(res, 404, 'Application not found.');

  const isCandidate = application.candidate._id.toString() === req.user._id.toString();
  const isRecruiter =
    application.job.recruiter?.toString() === req.user._id.toString() || req.user.role === 'admin';

  if (!isCandidate && !isRecruiter) {
    return errorResponse(res, 403, 'Not authorized.');
  }

  return successResponse(res, 200, 'Application retrieved.', application);
});
