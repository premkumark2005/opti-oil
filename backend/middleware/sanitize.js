const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

/**
 * Data Sanitization Middleware
 * Prevents NoSQL injection and XSS attacks
 */

// Remove any keys that start with '$' or contain '.'
const sanitizeMongoQuery = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Potential NoSQL injection attempt detected: ${key}`);
  }
});

// Clean user input from malicious HTML/JS
const sanitizeXSS = xss();

// Custom sanitization for specific fields
const sanitizeInput = (req, res, next) => {
  // Trim whitespace from string fields
  const trimStrings = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(trimStrings);
    }
    
    const trimmed = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        trimmed[key] = value.trim();
      } else if (typeof value === 'object') {
        trimmed[key] = trimStrings(value);
      } else {
        trimmed[key] = value;
      }
    }
    return trimmed;
  };

  if (req.body) {
    req.body = trimStrings(req.body);
  }

  if (req.query) {
    req.query = trimStrings(req.query);
  }

  next();
};

module.exports = {
  sanitizeMongoQuery,
  sanitizeXSS,
  sanitizeInput
};
