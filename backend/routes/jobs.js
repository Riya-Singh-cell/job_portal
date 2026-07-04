/**
 * @file routes/jobs.js
 * @description Job listing routes.
 */

const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  duplicateJob,
  toggleJobStatus,
  getMyJobs,
} = require('../controllers/jobController');
const { protect, authorize, optionalAuth } = require('../middlewares/auth');

// Public routes (with optional auth for saved status)
router.get('/', optionalAuth, getJobs);
router.get('/recruiter/my-jobs', protect, authorize('recruiter'), getMyJobs);
router.get('/:id', optionalAuth, getJob);

// Protected recruiter routes
router.use(protect);
router.post('/', authorize('recruiter'), createJob);
router.put('/:id', authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', authorize('recruiter', 'admin'), deleteJob);
router.post('/:id/duplicate', authorize('recruiter'), duplicateJob);
router.patch('/:id/status', authorize('recruiter', 'admin'), toggleJobStatus);

module.exports = router;
