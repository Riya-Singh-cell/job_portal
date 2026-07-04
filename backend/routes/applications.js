/**
 * @file routes/applications.js
 * @description Application management routes.
 */

const express = require('express');
const router = express.Router();
const {
  applyToJob,
  getMyApplications,
  withdrawApplication,
  getJobApplications,
  updateApplicationStatus,
  scheduleInterview,
  getApplication,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middlewares/auth');
const { uploadResume } = require('../config/cloudinary');

router.use(protect);

// Candidate routes
router.get('/my-applications', authorize('candidate'), getMyApplications);
router.post('/:jobId', authorize('candidate'), uploadResume.single('resume'), applyToJob);
router.delete('/:id/withdraw', authorize('candidate'), withdrawApplication);

// Shared route (candidate + recruiter + admin)
router.get('/:id', getApplication);

// Recruiter routes
router.get('/job/:jobId', authorize('recruiter', 'admin'), getJobApplications);
router.patch('/:id/status', authorize('recruiter', 'admin'), updateApplicationStatus);
router.post('/:id/interview', authorize('recruiter'), scheduleInterview);

module.exports = router;
