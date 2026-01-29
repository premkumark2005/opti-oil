import Notification from '../models/Notification.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { sendSuccess, sendPaginatedResponse } from '../utils/response.js';
import { HTTP_STATUS, DEFAULTS } from '../config/constants.js';

/**
 * @desc    Get user's notifications
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || DEFAULTS.PAGE;
  const limit = parseInt(req.query.limit) || DEFAULTS.LIMIT;
  const skip = (page - 1) * limit;

  const filter = { user: req.user.id };

  // Filter by read status
  if (req.query.isRead !== undefined) {
    filter.isRead = req.query.isRead === 'true';
  }

  // Filter by type
  if (req.query.type) {
    filter.type = req.query.type;
  }

  const total = await Notification.countDocuments(filter);

  const notifications = await Notification.find(filter)
    .populate('relatedOrder', 'orderNumber totalAmount orderStatus')
    .populate('relatedProduct', 'name sku')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  sendPaginatedResponse(
    res,
    notifications,
    page,
    limit,
    total,
    'Notifications retrieved successfully'
  );
});

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/unread/count
 * @access  Private
 */
export const getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Notification.getUnreadCount(req.user.id);

  sendSuccess(res, HTTP_STATUS.OK, {
    unreadCount: count
  }, 'Unread count retrieved successfully');
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const notification = await Notification.findOne({
    _id: id,
    user: req.user.id
  });

  if (!notification) {
    return next(new AppError('Notification not found', HTTP_STATUS.NOT_FOUND));
  }

  notification.markAsRead();
  await notification.save();

  sendSuccess(res, HTTP_STATUS.OK, {
    notification
  }, 'Notification marked as read');
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/mark-all-read
 * @access  Private
 */
export const markAllAsRead = asyncHandler(async (req, res, next) => {
  const result = await Notification.markAllAsRead(req.user.id);

  sendSuccess(res, HTTP_STATUS.OK, {
    modifiedCount: result.modifiedCount
  }, 'All notifications marked as read');
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const notification = await Notification.findOneAndDelete({
    _id: id,
    user: req.user.id
  });

  if (!notification) {
    return next(new AppError('Notification not found', HTTP_STATUS.NOT_FOUND));
  }

  sendSuccess(res, HTTP_STATUS.OK, {}, 'Notification deleted successfully');
});

/**
 * @desc    Delete all read notifications
 * @route   DELETE /api/notifications/read
 * @access  Private
 */
export const deleteReadNotifications = asyncHandler(async (req, res, next) => {
  const result = await Notification.deleteMany({
    user: req.user.id,
    isRead: true
  });

  sendSuccess(res, HTTP_STATUS.OK, {
    deletedCount: result.deletedCount
  }, 'Read notifications deleted successfully');
});

/**
 * @desc    Get notification statistics (Admin)
 * @route   GET /api/notifications/stats
 * @access  Private/Admin
 */
export const getNotificationStats = asyncHandler(async (req, res, next) => {
  const stats = await Notification.aggregate([
    {
      $facet: {
        typeDistribution: [
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 },
              unread: {
                $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
              }
            }
          },
          {
            $sort: { count: -1 }
          }
        ],
        overallStats: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              unread: {
                $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
              },
              read: {
                $sum: { $cond: [{ $eq: ['$isRead', true] }, 1, 0] }
              }
            }
          }
        ]
      }
    }
  ]);

  sendSuccess(res, HTTP_STATUS.OK, {
    stats: stats[0]
  }, 'Notification statistics retrieved successfully');
});
