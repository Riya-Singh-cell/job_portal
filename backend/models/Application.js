const mongoose = require('mongoose');

/**
 * @module models/Application
 * @description Mongoose model for job applications. Tracks the full lifecycle of
 * a candidate's application from submission through final decision. Includes a
 * timeline sub-document array for audit-trail status changes and an AI-generated
 * match score for intelligent candidate ranking.
 */

/**
 * @typedef {Object} TimelineEntry
 * @property {string} status - The status at this point in time
 * @property {Date} date - When the status change occurred
 * @property {string} comment - Optional recruiter/system comment about the change
 */
const timelineEntrySchema = new mongoose.Schema(
  {
    status: { type: String },
    date: { type: Date, default: Date.now },
    comment: { type: String },
  },
  { _id: true }
);

/**
 * @typedef {Object} Application
 * @property {mongoose.Types.ObjectId} job - Reference to the job being applied for
 * @property {mongoose.Types.ObjectId} candidate - Reference to the applying user
 * @property {string} resume - URL to the resume submitted with this application
 * @property {string} coverLetter - Cover letter text
 * @property {string} status - Current application status
 * @property {TimelineEntry[]} timeline - Chronological log of status changes
 * @property {number} aiMatchScore - AI-calculated match score (0–100)
 */
const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Application must reference a job'],
    },

    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Application must reference a candidate'],
    },

    resume: {
      type: String,
    },

    coverLetter: {
      type: String,
    },

    status: {
      type: String,
      enum: {
        values: ['pending', 'shortlisted', 'interviewing', 'accepted', 'rejected'],
        message: '{VALUE} is not a valid application status',
      },
      default: 'pending',
    },

    timeline: [timelineEntrySchema],

    aiMatchScore: {
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
 * Compound unique index ensuring a candidate can only apply once per job.
 * Attempting a duplicate application will throw a MongoDB E11000 duplicate key error.
 */
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

// ─── Export ─────────────────────────────────────────────────────────────────────

module.exports = mongoose.model('Application', applicationSchema);
