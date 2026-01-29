import ApiResponse from '../utils/apiResponse.js';

/**
 * Custom Error Class
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async handler wrapper to avoid try-catch blocks
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Handle specific error types
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: ${field} = '${value}'. Please use another value.`;
  return new AppError(message, 409);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => ({
    field: el.path,
    message: el.message,
    value: el.value
  }));

  return {
    message: 'Validation failed',
    statusCode: 422,
    errors,
    isOperational: true
  };
};

const handleJWTError = () => 
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () => 
  new AppError('Your token has expired. Please log in again.', 401);

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Stack:', err.stack);
    console.error('Error Details:', err);
  }

  // Handle specific Mongoose errors
  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  // Send response based on environment
  if (err.isOperational || error.isOperational) {
    return ApiResponse.error(res, {
      message: error.message,
      statusCode: error.statusCode,
      errors: error.errors || null,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }

  // Programming or other unknown error
  console.error('ERROR 💥', err);
  return ApiResponse.error(res, {
    message: 'Something went wrong. Please try again later.',
    statusCode: 500
  });
};
