import { body, param, query } from 'express-validator';
import { RAW_MATERIAL_ORDER_STATUS } from '../config/constants.js';

// Validation for creating raw material order
export const validateCreateRawMaterialOrder = [
  body('rawMaterialId')
    .notEmpty()
    .withMessage('Raw material ID is required')
    .isMongoId()
    .withMessage('Invalid raw material ID'),
  
  body('quantityOrdered')
    .notEmpty()
    .withMessage('Quantity is required')
    .isFloat({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// Validation for updating order status
export const validateUpdateOrderStatus = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID'),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(RAW_MATERIAL_ORDER_STATUS))
    .withMessage('Invalid status')
];

// Validation for order ID parameter
export const validateOrderId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID')
];

// Validation for order query parameters
export const validateOrderQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(Object.values(RAW_MATERIAL_ORDER_STATUS))
    .withMessage('Invalid status'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format')
];
