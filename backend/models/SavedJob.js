const mongoose = require('mongoose');

/**
 * @module models/SavedJob
 * @description Mongoose model for saved/bookmarked jobs. Allows candidates to
 * save job listings for later review. The compound unique index on (user, job)
 * prevents a user from saving the same job more than once.
 */

/**
 * @typedef {Object} SavedJob
 * @property {mongoose.Types.ObjectId} user - Reference to the user who saved the job
 * @property {mongoose.Types.ObjectId} job - Reference to the saved job listing
 */
const savedJobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Saved job must reference a user'],
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Saved job must reference a job'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────────

/**
 * Compound unique index ensuring a user can only save a specific job once.
 * Attempting a duplicate save will throw a MongoDB E11000 duplicate key error.
 */
savedJobSchema.index({ user: 1, job: 1 }, { unique: true });

// ─── Export ─────────────────────────────────────────────────────────────────────

module.exports = mongoose.model('SavedJob', savedJobSchema);
