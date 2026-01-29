import { body, param } from 'express-validator';
import { handleValidationErrors } from '../utils/validators.js';

/**
 * Validation for stock-in operation
 */
export const validateStockIn = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  body('supplierId')
    .optional()
    .isMongoId()
    .withMessage('Invalid supplier ID'),
  
  body('referenceNumber')
    .optional()
    .trim(),
  
  body('unitCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit cost must be a positive number'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  handleValidationErrors
];

/**
 * Validation for stock-out operation
 */
export const validateStockOut = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  body('orderId')
    .optional()
    .isMongoId()
    .withMessage('Invalid order ID'),
  
  body('referenceNumber')
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
 * Validation for reorder level update
 */
export const validateReorderLevel = [
  param('id')
    .notEmpty()
    .withMessage('Inventory ID is required')
    .isMongoId()
    .withMessage('Invalid inventory ID'),
  
  body('reorderLevel')
    .notEmpty()
    .withMessage('Reorder level is required')
    .isInt({ min: 0 })
    .withMessage('Reorder level must be a non-negative integer'),
  
  handleValidationErrors
];

/**
 * Validation for inventory adjustment
 */
export const validateInventoryAdjustment = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt()
    .withMessage('Quantity must be an integer')
    .custom((value) => {
      if (value === 0) {
        throw new Error('Quantity cannot be zero');
      }
      return true;
    }),
  
  body('notes')
    .notEmpty()
    .withMessage('Notes are required for inventory adjustments')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Notes must be between 5 and 500 characters'),
  
  handleValidationErrors
];
