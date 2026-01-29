import { HTTP_STATUS } from '../config/constants.js';

/**
 * 404 Not Found Middleware
 * Handles requests to undefined routes
 */
export const notFound = (req, res, next) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: `Route not found: ${req.originalUrl}`,
    method: req.method,
    path: req.path
  });
};
