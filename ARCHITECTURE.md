# Architecture & Best Practices

## Application Architecture

### Backend (Node.js + Express + MongoDB)

```
backend/
├── config/              # Configuration files
│   ├── db.js           # Database connection
│   ├── constants.js    # Application constants
│   └── security.js     # Security configurations
├── controllers/        # Business logic
│   ├── authController.js
│   ├── productController.js
│   ├── orderController.js
│   └── ...
├── middleware/         # Custom middleware
│   ├── auth.js        # Authentication middleware
│   ├── errorHandler.js # Error handling
│   ├── validate.js    # Validation middleware
│   ├── rateLimiter.js # Rate limiting
│   └── sanitize.js    # Input sanitization
├── models/            # Mongoose schemas
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   └── ...
├── routes/            # API routes
│   ├── authRoutes.js
│   ├── productRoutes.js
│   └── ...
├── validators/        # Input validation rules
│   ├── authValidators.js
│   ├── productValidators.js
│   └── ...
├── utils/            # Utility functions
│   ├── apiResponse.js # Standardized responses
│   └── logger.js     # Logging utility
├── app.js            # Express app configuration
└── server.js         # Server entry point
```

### Frontend (React + Vite)

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   │   ├── common/    # Shared UI components
│   │   ├── layout/    # Layout components
│   │   └── ErrorBoundary.jsx
│   ├── context/       # React Context
│   │   └── AuthContext.jsx
│   ├── pages/         # Page components
│   │   ├── admin/    # Admin dashboard pages
│   │   └── wholesaler/ # Wholesaler pages
│   ├── services/      # API services
│   │   ├── api.js    # Axios instance
│   │   ├── authService.js
│   │   └── ...
│   ├── utils/        # Utility functions
│   │   └── validation.js
│   ├── App.jsx       # Main app component
│   └── main.jsx      # Entry point
```

## Design Patterns

### 1. MVC Pattern (Backend)
- **Models**: Mongoose schemas define data structure
- **Views**: JSON responses (API)
- **Controllers**: Handle business logic

### 2. Service Layer Pattern
- Services encapsulate API calls
- Centralized data fetching logic
- Easy to test and maintain

### 3. Provider Pattern (Frontend)
- AuthContext for global state
- React Query for server state
- Separation of concerns

### 4. Error Boundary Pattern
- Catch React errors
- Graceful degradation
- User-friendly error messages

## Best Practices

### Backend

#### 1. **Async/Await with Error Handling**
```javascript
// Use asyncHandler wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// In controllers
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  return ApiResponse.success(res, { data: products });
});
```

#### 2. **Input Validation**
```javascript
// Define validators
const createProductValidation = [
  body('name').trim().notEmpty(),
  body('price').isFloat({ min: 0 })
];

// Use in routes
router.post('/', createProductValidation, validate, createProduct);
```

#### 3. **Standardized Responses**
```javascript
// Success
return ApiResponse.success(res, {
  data: products,
  message: 'Products retrieved successfully'
});

// Error
return ApiResponse.badRequest(res, {
  message: 'Invalid input',
  errors: validationErrors
});
```

#### 4. **Database Queries**
```javascript
// Use lean() for read-only queries
const products = await Product.find().lean();

// Use select() to limit fields
const users = await User.find().select('-password');

// Use indexes for frequently queried fields
productSchema.index({ category: 1, isActive: 1 });
```

#### 5. **Environment Variables**
```javascript
// Never hardcode sensitive data
const JWT_SECRET = process.env.JWT_SECRET;
const DB_URI = process.env.MONGODB_URI;
```

### Frontend

#### 1. **React Query for Data Fetching**
```javascript
// Query
const { data, isLoading, error } = useQuery('products', productService.getProducts);

// Mutation
const mutation = useMutation(productService.createProduct, {
  onSuccess: () => {
    queryClient.invalidateQueries('products');
    toast.success('Product created');
  }
});
```

#### 2. **Error Handling**
```javascript
// API interceptor handles errors globally
// Use try-catch for specific error handling
try {
  await orderService.placeOrder(orderData);
} catch (error) {
  // Specific error handling if needed
  console.error('Order failed:', error);
}
```

#### 3. **Form Validation**
```javascript
import { validateForm, productFormValidator } from '../utils/validation';

const { isValid, errors } = validateForm(formData, productFormValidator);
if (!isValid) {
  setFormErrors(errors);
  return;
}
```

#### 4. **Component Organization**
```javascript
// Keep components focused and single-purpose
// Extract reusable logic into custom hooks
// Use composition over inheritance
```

## Security Best Practices

### 1. **Input Sanitization**
- Trim whitespace
- Remove dangerous characters
- Validate data types

### 2. **Authentication**
- Hash passwords with bcrypt
- Use JWT with expiration
- Validate tokens on every request
- Implement refresh tokens for production

### 3. **Authorization**
- Check user roles
- Validate resource ownership
- Implement RBAC (Role-Based Access Control)

### 4. **Rate Limiting**
- Prevent brute force attacks
- Protect against DDoS
- Different limits for different endpoints

### 5. **HTTPS Only (Production)**
- Encrypt data in transit
- Use secure cookies
- Enable HSTS headers

## Performance Optimization

### Backend

1. **Database Indexing**
   - Index frequently queried fields
   - Compound indexes for multi-field queries

2. **Caching**
   - Use Redis for session storage
   - Cache frequently accessed data

3. **Pagination**
   - Limit response size
   - Use cursor-based pagination for large datasets

### Frontend

1. **Code Splitting**
   - Lazy load routes
   - Dynamic imports for large components

2. **Memoization**
   - Use React.memo for expensive components
   - useMemo for expensive calculations

3. **Virtual Scrolling**
   - For large lists
   - Improve rendering performance

## Scalability Considerations

### Horizontal Scaling
- Stateless application design
- Session storage in database/Redis
- Load balancer ready

### Microservices (Future)
- Separate services for different domains
- API Gateway pattern
- Event-driven architecture

### Database Optimization
- Read replicas for scaling reads
- Sharding for large datasets
- Connection pooling

## Testing Strategy

### Backend
- Unit tests for utilities and helpers
- Integration tests for API endpoints
- Test error handling paths

### Frontend
- Component testing with React Testing Library
- E2E tests with Cypress/Playwright
- Test user workflows

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] HTTPS/SSL certificates
- [ ] Error monitoring (Sentry)
- [ ] Logging infrastructure
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers enabled
- [ ] Database indexes created
- [ ] Health check endpoints
- [ ] CI/CD pipeline
- [ ] Documentation updated

## Monitoring & Logging

### Application Monitoring
- Track API response times
- Monitor error rates
- Database query performance

### Business Metrics
- User registrations
- Order completion rates
- Revenue tracking
- Inventory turnover

### Logging
- Centralized logging
- Log levels (info, warn, error)
- Structured logging format
- Log retention policy
