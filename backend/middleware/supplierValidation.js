import { body, param } from 'express-validator';
import { handleValidationErrors } from '../utils/validators.js';

/**
 * Validation for adding supplier
 */
export const validateAddSupplier = [
  body('name')
    .notEmpty()
    .withMessage('Supplier name is required')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Supplier name must be between 2 and 200 characters'),
  
  body('contactPerson')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Contact person name cannot exceed 100 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim(),
  
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.zipCode').optional().trim(),
  body('address.country').optional().trim(),
  
  body('taxId')
    .optional()
    .trim(),
  
  body('paymentTerms')
    .optional()
    .trim(),
  
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  
  body('suppliedProducts')
    .optional()
    .isArray()
    .withMessage('Supplied products must be an array'),
  
  body('suppliedProducts.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid product ID in supplied products'),
  
  handleValidationErrors
];

/**
 * Validation for updating supplier
 */
export const validateUpdateSupplier = [
  param('id')
    .notEmpty()
    .withMessage('Supplier ID is required')
    .isMongoId()
    .withMessage('Invalid supplier ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Supplier name must be between 2 and 200 characters'),
  
  body('contactPerson')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Contact person name cannot exceed 100 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim(),
  
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.zipCode').optional().trim(),
  body('address.country').optional().trim(),
  
  body('taxId')
    .optional()
    .trim(),
  
  body('paymentTerms')
    .optional()
    .trim(),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  
  handleValidationErrors
];

/**
 * Validation for linking products
 */
export const validateLinkProducts = [
  param('id')
    .notEmpty()
    .withMessage('Supplier ID is required')
    .isMongoId()
    .withMessage('Invalid supplier ID'),
  
  body('productIds')
    .notEmpty()
    .withMessage('Product IDs are required')
    .isArray({ min: 1 })
    .withMessage('Product IDs must be a non-empty array'),
  
  body('productIds.*')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  handleValidationErrors
];

/**
 * Validation for supplier ID parameter
 */
export const validateSupplierId = [
  param('id')
    .notEmpty()
    .withMessage('Supplier ID is required')
    .isMongoId()
    .withMessage('Invalid supplier ID'),
  
  handleValidationErrors
];

/**
 * Validation for product ID parameter
 */
export const validateProductId = [
  param('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  handleValidationErrors
];
