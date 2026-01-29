const { body, param } = require('express-validator');

/**
 * Supplier Validators
 */

const createSupplierValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Supplier name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Supplier name must be between 2 and 200 characters'),

  body('contactPerson')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Contact person name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Please provide a valid phone number'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Address is too long'),

  body('taxId')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Tax ID is too long'),

  body('paymentTerms')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Payment terms are too long')
];

const updateSupplierValidation = [
  param('id')
    .isMongoId().withMessage('Invalid supplier ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Supplier name must be between 2 and 200 characters'),

  body('contactPerson')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Contact person name must be between 2 and 100 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Please provide a valid phone number'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean')
];

const supplierIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid supplier ID')
];

module.exports = {
  createSupplierValidation,
  updateSupplierValidation,
  supplierIdValidation
};
