const rateLimit = require('express-rate-limit');
const ApiResponse = require('../utils/apiResponse');

/**
 * Rate Limiting Middleware
 * Prevents brute force attacks and API abuse
 */

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 for dev, 100 for production
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ApiResponse.error(res, {
      message: 'Too many requests. Please try again later.',
      statusCode: 429
    });
  }
});

// Strict limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 100, // 100 for dev, 5 for production
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again after 15 minutes.',
  handler: (req, res) => {
    return ApiResponse.error(res, {
      message: 'Too many login attempts. Please try again after 15 minutes.',
      statusCode: 429
    });
  }
});

// Moderate limiter for order creation
const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // 100 for dev, 10 for production
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    return ApiResponse.error(res, {
      message: 'Order limit exceeded. Please try again later.',
      statusCode: 429
    });
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  orderLimiter
};
