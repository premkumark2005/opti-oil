const { body, param, query } = require('express-validator');

/**
 * Product Validators
 */

const createProductValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Product name must be between 2 and 200 characters'),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isIn(['Vegetable Oil', 'Cooking Oil', 'Olive Oil', 'Palm Oil', 'Coconut Oil', 'Sunflower Oil', 'Other'])
    .withMessage('Invalid category'),

  body('basePrice')
    .notEmpty().withMessage('Base price is required')
    .isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),

  body('unit')
    .trim()
    .notEmpty().withMessage('Unit is required')
    .isIn(['Liter', 'Kilogram', 'Gallon', 'Bottle', 'Can'])
    .withMessage('Invalid unit'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description is too long'),

  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Brand name is too long'),

  body('packagingSize')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Packaging size is too long'),

  body('specifications')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Specifications are too long')
];

const updateProductValidation = [
  param('id')
    .isMongoId().withMessage('Invalid product ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Product name must be between 2 and 200 characters'),

  body('category')
    .optional()
    .trim()
    .isIn(['Vegetable Oil', 'Cooking Oil', 'Olive Oil', 'Palm Oil', 'Coconut Oil', 'Sunflower Oil', 'Other'])
    .withMessage('Invalid category'),

  body('basePrice')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),

  body('unit')
    .optional()
    .trim()
    .isIn(['Liter', 'Kilogram', 'Gallon', 'Bottle', 'Can'])
    .withMessage('Invalid unit'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description is too long'),

  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Brand name is too long'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean')
];

const productIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid product ID')
];

const productQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search term is too long'),

  query('category')
    .optional()
    .trim(),

  query('minPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Min price must be a positive number'),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Max price must be a positive number')
];

module.exports = {
  createProductValidation,
  updateProductValidation,
  productIdValidation,
  productQueryValidation
};
