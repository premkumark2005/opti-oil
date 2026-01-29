const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');

/**
 * Validation Middleware
 * Checks validation results and returns errors if any
 */

const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));

    return ApiResponse.validationError(res, {
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

module.exports = validate;
