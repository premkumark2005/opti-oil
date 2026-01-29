const { body, param, query } = require('express-validator');

/**
 * Order Validators
 */

const placeOrderValidation = [
  body('items')
    .isArray({ min: 1 }).withMessage('Order must contain at least one item'),

  body('items.*.product')
    .isMongoId().withMessage('Invalid product ID'),

  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),

  body('items.*.unitPrice')
    .isFloat({ min: 0.01 }).withMessage('Unit price must be greater than 0'),

  body('shippingAddress')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Shipping address is too long')
];

const approveOrderValidation = [
  param('id')
    .isMongoId().withMessage('Invalid order ID')
];

const rejectOrderValidation = [
  param('id')
    .isMongoId().withMessage('Invalid order ID'),

  body('reason')
    .trim()
    .notEmpty().withMessage('Rejection reason is required')
    .isLength({ min: 5, max: 500 }).withMessage('Reason must be between 5 and 500 characters')
];

const updateOrderStatusValidation = [
  param('id')
    .isMongoId().withMessage('Invalid order ID'),

  body('status')
    .trim()
    .notEmpty().withMessage('Status is required')
    .isIn(['processing', 'shipped', 'delivered'])
    .withMessage('Invalid status. Must be processing, shipped, or delivered')
];

const cancelOrderValidation = [
  param('id')
    .isMongoId().withMessage('Invalid order ID'),

  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Cancellation reason is too long')
];

const orderQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .trim()
    .isIn(['pending', 'approved', 'rejected', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status')
];

module.exports = {
  placeOrderValidation,
  approveOrderValidation,
  rejectOrderValidation,
  updateOrderStatusValidation,
  cancelOrderValidation,
  orderQueryValidation
};
