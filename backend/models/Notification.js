const mongoose = require('mongoose');

/**
 * @module models/Notification
 * @description Mongoose model for in-app notifications. Supports various notification
 * types (job updates, application status changes, interview scheduling, messages, and
 * system alerts). Indexed for efficient retrieval of unread notifications per user.
 */

/**
 * @typedef {Object} Notification
 * @property {mongoose.Types.ObjectId} recipient - The user receiving the notification
 * @property {mongoose.Types.ObjectId} sender - The user who triggered the notification (optional for system notifications)
 * @property {string} type - Category of the notification
 * @property {string} title - Short notification headline
 * @property {string} message - Full notification body
 * @property {boolean} isRead - Whether the recipient has read this notification
 * @property {string} link - Optional deep link to related content (e.g., "/jobs/123")
 */
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification must have a recipient'],
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    type: {
      type: String,
      enum: {
        values: [
          'job_update',
          'application_status',
          'interview_scheduled',
          'message',
          'system',
        ],
        message: '{VALUE} is not a valid notification type',
      },
    },

    title: {
      type: String,
      required: [true, 'Notification title is required'],
    },

    message: {
      type: String,
      required: [true, 'Notification message is required'],
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    link: {
      type: String,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────────

/**
 * Compound index on recipient and isRead for fast inbox queries.
 * Optimizes the common pattern: "fetch all unread notifications for user X".
 *
 * @example
 * const unread = await Notification.find({ recipient: userId, isRead: false })
 *   .sort({ createdAt: -1 });
 */
notificationSchema.index({ recipient: 1, isRead: 1 });

// ─── Export ─────────────────────────────────────────────────────────────────────

module.exports = mongoose.model('Notification', notificationSchema);
