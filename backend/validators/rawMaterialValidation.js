import { body, param, query } from 'express-validator';
import { RAW_MATERIAL_CATEGORIES, RAW_MATERIAL_UNITS } from '../config/constants.js';

// Validation for creating raw material
export const validateCreateRawMaterial = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Raw material name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(Object.values(RAW_MATERIAL_CATEGORIES))
    .withMessage('Invalid category'),
  
  body('unit')
    .notEmpty()
    .withMessage('Unit is required')
    .isIn(Object.values(RAW_MATERIAL_UNITS))
    .withMessage('Unit must be either kg or litre'),
  
  body('pricePerUnit')
    .notEmpty()
    .withMessage('Price per unit is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('availableQuantity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Available quantity must be a positive number'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

// Validation for updating raw material
export const validateUpdateRawMaterial = [
  param('id')
    .isMongoId()
    .withMessage('Invalid raw material ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('category')
    .optional()
    .isIn(Object.values(RAW_MATERIAL_CATEGORIES))
    .withMessage('Invalid category'),
  
  body('unit')
    .optional()
    .isIn(Object.values(RAW_MATERIAL_UNITS))
    .withMessage('Unit must be either kg or litre'),
  
  body('pricePerUnit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('availableQuantity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Available quantity must be a positive number'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive')
];

// Validation for raw material ID parameter
export const validateRawMaterialId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid raw material ID')
];

// Validation for query parameters
export const validateRawMaterialQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('category')
    .optional()
    .isIn(Object.values(RAW_MATERIAL_CATEGORIES))
    .withMessage('Invalid category'),
  
  query('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
  
  query('supplier')
    .optional()
    .isMongoId()
    .withMessage('Invalid supplier ID')
];
