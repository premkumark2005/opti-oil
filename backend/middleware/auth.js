import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler, AppError } from './errorHandler.js';
import { HTTP_STATUS, USER_ROLES } from '../config/constants.js';

/**
 * Protect routes - Verify JWT token
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return next(new AppError('Not authorized to access this route', HTTP_STATUS.UNAUTHORIZED));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new AppError('User not found', HTTP_STATUS.UNAUTHORIZED));
    }

    // Check if user is active
    if (req.user.status === 'inactive') {
      return next(new AppError('Your account has been deactivated', HTTP_STATUS.FORBIDDEN));
    }

    next();
  } catch (error) {
    return next(new AppError('Not authorized to access this route', HTTP_STATUS.UNAUTHORIZED));
  }
});

/**
 * Grant access to specific roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role '${req.user.role}' is not authorized to access this route`,
          HTTP_STATUS.FORBIDDEN
        )
      );
    }
    next();
  };
};

/**
 * Check if user is admin
 */
export const isAdmin = authorize(USER_ROLES.ADMIN);

/**
 * Check if user is wholesaler
 */
export const isWholesaler = authorize(USER_ROLES.WHOLESALER);

/**
 * Check if user is admin or wholesaler
 */
export const isAdminOrWholesaler = authorize(USER_ROLES.ADMIN, USER_ROLES.WHOLESALER);
