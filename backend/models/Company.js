const mongoose = require('mongoose');

/**
 * @module models/Company
 * @description Mongoose model for companies. Each company is created by a recruiter
 * and serves as the organizational entity that job listings are associated with.
 */

/**
 * @typedef {Object} Company
 * @property {string} name - Unique company name
 * @property {string} description - Company overview / about section
 * @property {string} website - Company website URL
 * @property {string} location - Headquarters or primary office location
 * @property {string} logo - URL to the company logo image
 * @property {string} industry - Industry sector (e.g., Technology, Finance)
 * @property {string} employeeCount - Approximate employee count range (e.g., "51-200")
 * @property {mongoose.Types.ObjectId} createdBy - Reference to the recruiter who registered this company
 */
const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      unique: true,
      trim: true,
    },

    description: {
      type: String,
    },

    website: {
      type: String,
    },

    location: {
      type: String,
    },

    logo: {
      type: String,
      default: '',
    },

    industry: {
      type: String,
    },

    employeeCount: {
      type: String,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Company must be associated with a recruiter'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// ─── Export ─────────────────────────────────────────────────────────────────────

module.exports = mongoose.model('Company', companySchema);
