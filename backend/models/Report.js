const mongoose = require('mongoose');

/**
 * @module models/Report
 * @description Mongoose model for user-submitted reports. Enables users to flag
 * inappropriate or fraudulent jobs, users, or companies for admin review.
 * Supports a review workflow with pending → reviewed → resolved statuses.
 */

/**
 * @typedef {Object} Report
 * @property {mongoose.Types.ObjectId} reporter - Reference to the user filing the report
 * @property {string} targetType - Type of entity being reported ('job', 'user', or 'company')
 * @property {mongoose.Types.ObjectId} targetId - ID of the reported entity (polymorphic reference)
 * @property {string} reason - Detailed description of why the entity is being reported
 * @property {string} status - Current review status of the report
 */
const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Report must reference the reporting user'],
    },

    targetType: {
      type: String,
      enum: {
        values: ['job', 'user', 'company'],
        message: '{VALUE} is not a valid report target type',
      },
      required: [true, 'Report target type is required'],
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Report must reference a target entity'],
    },

    reason: {
      type: String,
      required: [true, 'Report reason is required'],
    },

    status: {
      type: String,
      enum: {
        values: ['pending', 'reviewed', 'resolved'],
        message: '{VALUE} is not a valid report status',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// ─── Export ─────────────────────────────────────────────────────────────────────

module.exports = mongoose.model('Report', reportSchema);
