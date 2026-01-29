import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  getNotificationStats
} from '../controllers/notificationController.js';
import { protect, isAdmin } from '../middleware/auth.js';
import { param } from 'express-validator';
import { handleValidationErrors } from '../utils/validators.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// User notification routes
router.get('/', getNotifications);
router.get('/unread/count', getUnreadCount);
router.put('/mark-all-read', markAllAsRead);
router.delete('/read', deleteReadNotifications);

router.put(
  '/:id/read',
  [
    param('id').isMongoId().withMessage('Invalid notification ID'),
    handleValidationErrors
  ],
  markAsRead
);

router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid notification ID'),
    handleValidationErrors
  ],
  deleteNotification
);

// Admin routes
router.get('/stats', isAdmin, getNotificationStats);

export default router;
