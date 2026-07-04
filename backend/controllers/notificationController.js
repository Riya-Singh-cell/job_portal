/**
 * @file controllers/notificationController.js
 * @description Notification management controller.
 */

const Notification = require('../models/Notification');
const { successResponse, errorResponse, buildPagination } = require('../utils/apiResponse');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * GET /api/notifications
 * @desc Get notifications for the authenticated user
 */
exports.getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;

  const query = { recipient: req.user._id };
  if (unreadOnly === 'true') query.isRead = false;

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

  const notifications = await Notification.find(query)
    .populate('sender', 'name avatar')
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  return successResponse(
    res,
    200,
    'Notifications retrieved.',
    { notifications, unreadCount },
    buildPagination(parseInt(page), parseInt(limit), total)
  );
});

/**
 * PATCH /api/notifications/:id/read
 * @desc Mark a notification as read
 */
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) return errorResponse(res, 404, 'Notification not found.');

  return successResponse(res, 200, 'Notification marked as read.', notification);
});

/**
 * PATCH /api/notifications/read-all
 * @desc Mark all notifications as read
 */
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  return successResponse(res, 200, 'All notifications marked as read.');
});

/**
 * DELETE /api/notifications/:id
 * @desc Delete a notification
 */
exports.deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) return errorResponse(res, 404, 'Notification not found.');

  return successResponse(res, 200, 'Notification deleted.');
});
