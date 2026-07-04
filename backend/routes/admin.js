const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getUsers,
  updateUserStatus,
  getJobs,
  getRecruiterAnalytics,
  createReport,
  getReports,
  updateReportStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);

// Admin-only routes
router.get('/dashboard', authorize('admin'), getDashboard);
router.get('/users', authorize('admin'), getUsers);
router.patch('/users/:id/status', authorize('admin'), updateUserStatus);
router.get('/jobs', authorize('admin'), getJobs);
router.get('/recruiter/:id/analytics', authorize('admin'), getRecruiterAnalytics);
router.get('/reports', authorize('admin'), getReports);
router.patch('/reports/:id/status', authorize('admin'), updateReportStatus);

// Reports can be created by any authenticated user
router.post('/reports', createReport);

module.exports = router;
