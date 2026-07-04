/**
 * @file routes/users.js
 * @description User/candidate profile routes.
 */

const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  uploadResume,
  getCandidateDashboard,
  getRecommendations,
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');
const { uploadImage, uploadResume: uploadResumeMiddleware } = require('../config/cloudinary');

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/avatar', uploadImage.single('avatar'), uploadAvatar);
router.put('/profile/resume', uploadResumeMiddleware.single('resume'), uploadResume);
router.get('/dashboard/candidate', authorize('candidate'), getCandidateDashboard);
router.get('/recommendations', authorize('candidate'), getRecommendations);

module.exports = router;
