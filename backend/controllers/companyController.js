/**
 * @file controllers/companyController.js
 * @description Company management controller for recruiters.
 */

const Company = require('../models/Company');
const User = require('../models/User');
const { successResponse, errorResponse, buildPagination } = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

// ─── Create Company ───────────────────────────────────────────────────────────

/**
 * POST /api/companies
 * @desc Create a new company profile (recruiter only)
 */
exports.createCompany = asyncHandler(async (req, res) => {
  const { name, description, website, location, industry, employeeCount } = req.body;

  if (!name) {
    return errorResponse(res, 400, 'Company name is required.');
  }

  // Check if recruiter already has a company
  if (req.user.company) {
    return errorResponse(res, 409, 'You already have a company. Update it instead.');
  }

  const existing = await Company.findOne({ name: name.trim() });
  if (existing) {
    return errorResponse(res, 409, 'A company with this name already exists.');
  }

  const company = await Company.create({
    name: name.trim(),
    description,
    website,
    location,
    industry,
    employeeCount,
    createdBy: req.user._id,
  });

  // Link company to recruiter
  await User.findByIdAndUpdate(req.user._id, { company: company._id });

  return successResponse(res, 201, 'Company created successfully.', company);
});

// ─── List Companies ───────────────────────────────────────────────────────────

/**
 * GET /api/companies
 * @desc Get all companies with optional search
 */
exports.getCompanies = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { industry: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Company.countDocuments(query);
  const companies = await Company.find(query)
    .populate('createdBy', 'name avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  return successResponse(
    res,
    200,
    'Companies retrieved.',
    companies,
    buildPagination(parseInt(page), parseInt(limit), total)
  );
});

// ─── Get Company ──────────────────────────────────────────────────────────────

/**
 * GET /api/companies/:id
 * @desc Get a single company by ID
 */
exports.getCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id).populate('createdBy', 'name avatar');

  if (!company) {
    return errorResponse(res, 404, 'Company not found.');
  }

  return successResponse(res, 200, 'Company retrieved.', company);
});

// ─── Update Company ───────────────────────────────────────────────────────────

/**
 * PUT /api/companies/:id
 * @desc Update company profile
 */
exports.updateCompany = asyncHandler(async (req, res) => {
  let company = await Company.findById(req.params.id);

  if (!company) {
    return errorResponse(res, 404, 'Company not found.');
  }

  // Only the company creator or admin can update
  if (company.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Not authorized to update this company.');
  }

  const { name, description, website, location, industry, employeeCount } = req.body;

  company = await Company.findByIdAndUpdate(
    req.params.id,
    { name, description, website, location, industry, employeeCount },
    { new: true, runValidators: true }
  );

  return successResponse(res, 200, 'Company updated successfully.', company);
});

// ─── Upload Company Logo ──────────────────────────────────────────────────────

/**
 * PUT /api/companies/:id/logo
 * @desc Upload company logo
 */
exports.uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 400, 'Please provide an image file.');
  }

  const company = await Company.findById(req.params.id);
  if (!company) {
    return errorResponse(res, 404, 'Company not found.');
  }

  if (company.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Not authorized.');
  }

  const logoUrl = req.file.path || req.file.secure_url || `/uploads/images/${req.file.filename}`;

  company.logo = logoUrl;
  await company.save();

  return successResponse(res, 200, 'Logo uploaded successfully.', { logo: company.logo });
});
