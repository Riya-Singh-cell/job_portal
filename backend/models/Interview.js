const mongoose = require('mongoose');

/**
 * @module models/Interview
 * @description Mongoose model for interview scheduling. Links an interview to
 * the parent application, job, candidate, and recruiter. Supports different
 * interview types (Technical, HR, etc.) and formats (Online, On-Site).
 */

/**
 * @typedef {Object} Interview
 * @property {mongoose.Types.ObjectId} application - Reference to the parent application
 * @property {mongoose.Types.ObjectId} job - Reference to the job being interviewed for
 * @property {mongoose.Types.ObjectId} candidate - Reference to the candidate being interviewed
 * @property {mongoose.Types.ObjectId} recruiter - Reference to the recruiter conducting the interview
 * @property {Date} scheduledDate - Scheduled date and time for the interview
 * @property {string} type - Type of interview (Technical, HR, Behavioral, System Design)
 * @property {string} format - Interview format (Online or On-Site)
 * @property {string} meetingLink - Video conferencing link for online interviews
 * @property {string} feedback - Post-interview feedback from the interviewer
 */
const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Interview must reference an application'],
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Interview must reference a job'],
    },

    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Interview must reference a candidate'],
    },

    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Interview must reference a recruiter'],
    },

    scheduledDate: {
      type: Date,
      required: [true, 'Interview date is required'],
    },

    type: {
      type: String,
      enum: {
        values: ['Technical', 'HR', 'Behavioral', 'System Design'],
        message: '{VALUE} is not a valid interview type',
      },
      default: 'Technical',
    },

    format: {
      type: String,
      enum: {
        values: ['Online', 'On-Site'],
        message: '{VALUE} is not a valid interview format',
      },
      default: 'Online',
    },

    meetingLink: {
      type: String,
    },

    feedback: {
      type: String,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// ─── Export ─────────────────────────────────────────────────────────────────────

module.exports = mongoose.model('Interview', interviewSchema);
