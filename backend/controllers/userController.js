import { asyncHandler } from '../middleware/errorHandler.js';
import User from '../models/User.js';
import { sendSuccess } from '../utils/response.js';
import { HTTP_STATUS } from '../config/constants.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendAccountApprovalEmail, sendAccountDeactivationEmail } from '../utils/emailService.js';
import { Logger } from '../utils/logger.js';

/**
 * @desc    Get all wholesalers
 * @route   GET /api/users/wholesalers
 * @access  Private/Admin
 */
export const getAllWholesalers = asyncHandler(async (req, res, next) => {
  const wholesalers = await User.find({ role: 'wholesaler' })
    .select('-password')
    .sort({ createdAt: -1 });

  sendSuccess(res, HTTP_STATUS.OK, {
    count: wholesalers.length,
    users: wholesalers
  }, 'Wholesalers retrieved successfully');
});

/**
 * @desc    Update wholesaler status (activate/deactivate)
 * @route   PUT /api/users/:id/status
 * @access  Private/Admin
 */
export const updateWholesalerStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    throw new AppError('isActive must be a boolean', HTTP_STATUS.BAD_REQUEST);
  }

  const user = await User.findById(id);

  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }

  if (user.role !== 'wholesaler') {
    throw new AppError('Can only update wholesaler accounts', HTTP_STATUS.BAD_REQUEST);
  }

  // Store previous status to detect approval action
  const previousStatus = user.status;

  // Map isActive boolean to status string
  user.status = isActive ? 'active' : 'inactive';
  await user.save();

  // Send email notification (non-blocking)
  // If wholesaler is being approved (pending -> active), send approval email
  // If wholesaler is being deactivated, send deactivation email
  if (isActive && previousStatus === 'pending') {
    // Approval: pending -> active
    sendAccountApprovalEmail(user.email, user.name)
      .then(result => {
        if (result.success) {
          Logger.info(`Approval email sent successfully to ${user.email}`);
        } else {
          Logger.warn(`Failed to send approval email to ${user.email}: ${result.error}`);
        }
      })
      .catch(err => {
        Logger.error(`Unexpected error sending approval email to ${user.email}:`, err);
      });
  } else if (!isActive && previousStatus === 'active') {
    // Deactivation: active -> inactive
    sendAccountDeactivationEmail(user.email, user.name)
      .then(result => {
        if (result.success) {
          Logger.info(`Deactivation email sent successfully to ${user.email}`);
        } else {
          Logger.warn(`Failed to send deactivation email to ${user.email}: ${result.error}`);
        }
      })
      .catch(err => {
        Logger.error(`Unexpected error sending deactivation email to ${user.email}:`, err);
      });
  }

  sendSuccess(res, HTTP_STATUS.OK, {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      status: user.status,
      isActive: user.status === 'active'
    }
  }, `Wholesaler ${isActive ? 'activated' : 'deactivated'} successfully`);
});
