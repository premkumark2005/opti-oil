import mongoose from 'mongoose';
import { NOTIFICATION_TYPES } from '../config/constants.js';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: {
        values: Object.values(NOTIFICATION_TYPES),
        message: 'Invalid notification type'
      }
    },
    isRead: {
      type: Boolean,
      default: false
    },
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    relatedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    readAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

/**
 * Method to mark notification as read
 */
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this;
};

/**
 * Static method to create notification
 * @param {ObjectId} userId - User ID
 * @param {String} message - Notification message
 * @param {String} type - Notification type
 * @param {Object} options - Additional options (relatedOrder, relatedProduct, metadata)
 */
notificationSchema.statics.createNotification = async function (userId, message, type, options = {}) {
  return await this.create({
    user: userId,
    message,
    type,
    relatedOrder: options.relatedOrder,
    relatedProduct: options.relatedProduct,
    metadata: options.metadata
  });
};

/**
 * Static method to get unread count for user
 * @param {ObjectId} userId - User ID
 */
notificationSchema.statics.getUnreadCount = async function (userId) {
  return await this.countDocuments({
    user: userId,
    isRead: false
  });
};

/**
 * Static method to mark all as read for user
 * @param {ObjectId} userId - User ID
 */
notificationSchema.statics.markAllAsRead = async function (userId) {
  const now = new Date();
  return await this.updateMany(
    { user: userId, isRead: false },
    { $set: { isRead: true, readAt: now } }
  );
};

/**
 * Static method to delete old notifications
 * @param {Number} daysOld - Delete notifications older than this many days
 */
notificationSchema.statics.deleteOldNotifications = async function (daysOld = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return await this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true
  });
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
