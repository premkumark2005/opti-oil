# Security Guidelines

## Backend Security Features

### 1. Input Validation
- **express-validator**: Comprehensive validation for all API endpoints
- Custom validators for email, password, phone numbers
- Data type validation and sanitization
- Length and format constraints

### 2. Error Handling
- Standardized error responses
- Development vs production error details
- Custom AppError class for operational errors
- Async error handling with asyncHandler wrapper

### 3. Security Headers
- **Helmet.js**: Sets secure HTTP headers
- Content Security Policy (CSP)
- XSS Protection
- Frame options
- HSTS enabled

### 4. Data Sanitization
- **express-mongo-sanitize**: Prevents NoSQL injection
- **xss-clean**: Prevents XSS attacks
- Input trimming and cleaning
- Query parameter sanitization

### 5. Rate Limiting
- General API: 100 requests per 15 minutes
- Auth endpoints: 5 attempts per 15 minutes
- Order creation: 10 orders per hour
- Configurable per endpoint

### 6. Authentication & Authorization
- JWT-based authentication
- Bcrypt password hashing (10 rounds)
- Token expiration (7 days default)
- Role-based access control (Admin/Wholesaler)
- Password strength requirements

### 7. CORS Configuration
- Whitelist-based origin validation
- Credentials support
- Configurable for development/production

### 8. API Response Standardization
- Consistent response structure
- Success/error handling
- Pagination metadata
- Timestamp tracking

## Frontend Security Features

### 1. Error Boundaries
- Component-level error catching
- Graceful error display
- Development mode stack traces
- User-friendly error messages

### 2. Input Validation
- Client-side validation utilities
- Email/password format validation
- Number range validation
- Required field validation
- Form-level validation

### 3. API Security
- Automatic token attachment
- Token expiration handling
- Request/response interceptors
- Error handling with user feedback
- Retry logic for failed requests

### 4. XSS Prevention
- Input sanitization
- HTML encoding
- Safe string rendering

## Best Practices

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

### Environment Variables
- Never commit `.env` files
- Use `.env.example` as template
- Rotate JWT secrets regularly
- Use strong, random secrets in production

### Database Security
- Validate all inputs before DB queries
- Use parameterized queries (Mongoose does this)
- Implement proper indexes
- Regular backups

### Logging
- Log all authentication attempts
- Log critical errors
- Avoid logging sensitive data
- Use appropriate log levels

### Production Checklist
- [ ] Change all default secrets
- [ ] Enable HTTPS
- [ ] Configure production CORS
- [ ] Set NODE_ENV=production
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Configure error tracking
- [ ] Regular security audits
- [ ] Keep dependencies updated

## Reporting Security Issues

If you discover a security vulnerability, please email security@opti-oil.com instead of using the issue tracker.

## Updates and Patches

- Regularly update dependencies
- Monitor security advisories
- Apply patches promptly
- Test security updates in staging first
