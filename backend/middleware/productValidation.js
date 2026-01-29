import { body, param } from 'express-validator';
import { handleValidationErrors } from '../utils/validators.js';
import { PRODUCT_CATEGORIES, UNITS } from '../config/constants.js';

/**
 * Validation for creating product
 */
export const validateCreateProduct = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(Object.values(PRODUCT_CATEGORIES))
    .withMessage('Invalid category'),
  
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('basePrice')
    .notEmpty()
    .withMessage('Base price is required')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  
  body('sku')
    .optional()
    .trim()
    .toUpperCase(),
  
  body('unit')
    .notEmpty()
    .withMessage('Unit is required')
    .isIn(Object.values(UNITS))
    .withMessage('Invalid unit'),
  
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand name cannot exceed 100 characters'),
  
  body('packagingSize')
    .notEmpty()
    .withMessage('Packaging size is required')
    .isFloat({ min: 0 })
    .withMessage('Packaging size must be a positive number'),
  
  body('image')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image must be a valid URL'),
  
  body('reorderLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reorder level must be a non-negative integer'),
  
  handleValidationErrors
];

/**
 * Validation for updating product
 */
export const validateUpdateProduct = [
  param('id')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  
  body('category')
    .optional()
    .isIn(Object.values(PRODUCT_CATEGORIES))
    .withMessage('Invalid category'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('basePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  
  body('sku')
    .optional()
    .trim()
    .toUpperCase(),
  
  body('unit')
    .optional()
    .isIn(Object.values(UNITS))
    .withMessage('Invalid unit'),
  
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand name cannot exceed 100 characters'),
  
  body('packagingSize')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Packaging size must be a positive number'),
  
  body('image')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image must be a valid URL'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  handleValidationErrors
];

/**
 * Validation for product ID parameter
 */
export const validateProductId = [
  param('id')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  handleValidationErrors
];

/**
 * Validation for category parameter
 */
export const validateCategory = [
  param('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(Object.values(PRODUCT_CATEGORIES))
    .withMessage('Invalid category'),
  
  handleValidationErrors
];
