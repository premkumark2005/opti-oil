import { body, param } from 'express-validator';
import { handleValidationErrors } from '../utils/validators.js';
import { ORDER_STATUS } from '../config/constants.js';

/**
 * Validation for placing order
 */
export const validatePlaceOrder = [
  body('items')
    .notEmpty()
    .withMessage('Order items are required')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  
  body('items.*.productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  body('shippingAddress.street')
    .optional()
    .trim(),
  
  body('shippingAddress.city')
    .optional()
    .trim(),
  
  body('shippingAddress.state')
    .optional()
    .trim(),
  
  body('shippingAddress.zipCode')
    .optional()
    .trim(),
  
  body('shippingAddress.country')
    .optional()
    .trim(),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  handleValidationErrors
];

/**
 * Validation for order rejection
 */
export const validateRejectOrder = [
  param('id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Invalid order ID'),
  
  body('reason')
    .notEmpty()
    .withMessage('Rejection reason is required')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Rejection reason must be between 10 and 500 characters'),
  
  handleValidationErrors
];

/**
 * Validation for order cancellation
 */
export const validateCancelOrder = [
  param('id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Invalid order ID'),
  
  body('reason')
    .notEmpty()
    .withMessage('Cancellation reason is required')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Cancellation reason must be between 10 and 500 characters'),
  
  handleValidationErrors
];

/**
 * Validation for status update
 */
export const validateUpdateStatus = [
  param('id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Invalid order ID'),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn([ORDER_STATUS.PROCESSING, ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED])
    .withMessage('Invalid status value'),
  
  handleValidationErrors
];

/**
 * Validation for order ID parameter
 */
export const validateOrderId = [
  param('id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Invalid order ID'),
  
  handleValidationErrors
];
