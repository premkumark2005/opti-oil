/**
 * Frontend Validation Utilities
 * Client-side validation helpers
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePhone = (phone) => {
  if (!phone) return true; // Optional field
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone);
};

export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateMinLength = (value, min, fieldName = 'Field') => {
  if (value && value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  return null;
};

export const validateMaxLength = (value, max, fieldName = 'Field') => {
  if (value && value.length > max) {
    return `${fieldName} must not exceed ${max} characters`;
  }
  return null;
};

export const validateNumber = (value, { min, max, fieldName = 'Field' } = {}) => {
  const num = Number(value);
  
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  
  if (min !== undefined && num < min) {
    return `${fieldName} must be at least ${min}`;
  }
  
  if (max !== undefined && num > max) {
    return `${fieldName} must not exceed ${max}`;
  }
  
  return null;
};

export const validatePositiveNumber = (value, fieldName = 'Value') => {
  const num = Number(value);
  
  if (isNaN(num) || num <= 0) {
    return `${fieldName} must be a positive number`;
  }
  
  return null;
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
};

export const validateForm = (formData, rules) => {
  const errors = {};
  
  for (const [field, validators] of Object.entries(rules)) {
    const value = formData[field];
    
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Specific form validators
export const productFormValidator = {
  name: [
    (value) => validateRequired(value, 'Product name'),
    (value) => validateMinLength(value, 2, 'Product name'),
    (value) => validateMaxLength(value, 200, 'Product name')
  ],
  category: [
    (value) => validateRequired(value, 'Category')
  ],
  basePrice: [
    (value) => validateRequired(value, 'Price'),
    (value) => validatePositiveNumber(value, 'Price')
  ],
  unit: [
    (value) => validateRequired(value, 'Unit')
  ]
};

export const orderFormValidator = {
  items: [
    (value) => {
      if (!value || value.length === 0) {
        return 'Order must contain at least one item';
      }
      return null;
    }
  ]
};

export const supplierFormValidator = {
  name: [
    (value) => validateRequired(value, 'Supplier name'),
    (value) => validateMinLength(value, 2, 'Supplier name'),
    (value) => validateMaxLength(value, 200, 'Supplier name')
  ],
  email: [
    (value) => validateRequired(value, 'Email'),
    (value) => !validateEmail(value) ? 'Please provide a valid email' : null
  ],
  phone: [
    (value) => value && !validatePhone(value) ? 'Please provide a valid phone number' : null
  ]
};

export default {
  validateEmail,
  validatePassword,
  validatePhone,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateNumber,
  validatePositiveNumber,
  validateUrl,
  sanitizeInput,
  validateForm,
  productFormValidator,
  orderFormValidator,
  supplierFormValidator
};
