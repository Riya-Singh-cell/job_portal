const mongoose = require('mongoose');

/**
 * @module models/Job
 * @description Mongoose model for job listings. Supports full-text search across
 * title, description, and location via a compound text index. Each job is tied
 * to a company and the recruiter who posted it.
 */

/**
 * @typedef {Object} Salary
 * @property {number} min - Minimum salary
 * @property {number} max - Maximum salary
 * @property {string} currency - ISO 4217 currency code (default: 'USD')
 */

/**
 * @typedef {Object} Job
 * @property {string} title - Job title
 * @property {string} description - Detailed job description
 * @property {string[]} requirements - List of required qualifications / skills
 * @property {Salary} salary - Salary range and currency
 * @property {string} location - Job location (city, state, or "Remote")
 * @property {string} jobType - Employment type (Full-time, Part-time, etc.)
 * @property {string} experienceLevel - Required experience level
 * @property {mongoose.Types.ObjectId} company - Reference to the associated Company
 * @property {mongoose.Types.ObjectId} recruiter - Reference to the recruiter who posted the job
 * @property {string} status - Whether the listing is open or closed
 * @property {number} views - Number of times the job listing has been viewed
 * @property {number} applicationsCount - Cached count of applications received
 */
const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },

    description: {
      type: String,
      required: [true, 'Job description is required'],
    },

    requirements: {
      type: [String],
      required: [true, 'At least one requirement must be specified'],
    },

    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: {
        type: String,
        default: 'USD',
      },
    },

    location: {
      type: String,
      required: [true, 'Job location is required'],
    },

    jobType: {
      type: String,
      enum: {
        values: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
        message: '{VALUE} is not a valid job type',
      },
      default: 'Full-time',
    },

    experienceLevel: {
      type: String,
      enum: {
        values: ['Entry', 'Mid', 'Senior', 'Lead'],
        message: '{VALUE} is not a valid experience level',
      },
      default: 'Entry',
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Job must be associated with a company'],
    },

    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Job must be associated with a recruiter'],
    },

    status: {
      type: String,
      enum: {
        values: ['open', 'closed'],
        message: '{VALUE} is not a valid job status',
      },
      default: 'open',
    },

    views: {
      type: Number,
      default: 0,
    },

    applicationsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────────

/**
 * Compound text index for full-text search across title, description, and location.
 * Enables MongoDB's $text queries for keyword-based job searching.
 *
 * @example
 * const jobs = await Job.find({ $text: { $search: 'react developer' } });
 */
jobSchema.index({ title: 'text', description: 'text', location: 'text' });

// ─── Export ─────────────────────────────────────────────────────────────────────

module.exports = mongoose.model('Job', jobSchema);
