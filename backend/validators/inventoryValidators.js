const { body, param } = require('express-validator');

/**
 * Inventory Validators
 */

const stockInValidation = [
  body('product')
    .isMongoId().withMessage('Invalid product ID'),

  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),

  body('unitCost')
    .optional()
    .isFloat({ min: 0 }).withMessage('Unit cost must be a positive number'),

  body('referenceNumber')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Reference number is too long')
];

const stockOutValidation = [
  body('product')
    .isMongoId().withMessage('Invalid product ID'),

  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),

  body('referenceNumber')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Reference number is too long')
];

const updateReorderLevelValidation = [
  param('id')
    .isMongoId().withMessage('Invalid inventory ID'),

  body('reorderLevel')
    .notEmpty().withMessage('Reorder level is required')
    .isInt({ min: 0 }).withMessage('Reorder level must be a non-negative integer')
];

module.exports = {
  stockInValidation,
  stockOutValidation,
  updateReorderLevelValidation
};
