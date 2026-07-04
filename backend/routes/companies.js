/**
 * @file routes/companies.js
 * @description Company management routes.
 */

const express = require('express');
const router = express.Router();
const {
  createCompany,
  getCompanies,
  getCompany,
  updateCompany,
  uploadLogo,
} = require('../controllers/companyController');
const { protect, authorize } = require('../middlewares/auth');
const { uploadImage } = require('../config/cloudinary');

router.get('/', getCompanies);
router.get('/:id', getCompany);

router.use(protect);
router.post('/', authorize('recruiter'), createCompany);
router.put('/:id', authorize('recruiter', 'admin'), updateCompany);
router.put('/:id/logo', authorize('recruiter', 'admin'), uploadImage.single('logo'), uploadLogo);

module.exports = router;
