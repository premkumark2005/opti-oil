# Developer Quick Reference

## 🚀 Common Patterns

### Backend Controller Pattern
```javascript
import { asyncHandler } from '../middleware/errorHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import { Logger } from '../utils/logger.js';

// GET - Retrieve data
export const getItems = asyncHandler(async (req, res) => {
  const items = await Item.find();
  return ApiResponse.success(res, { 
    data: items,
    message: 'Items retrieved successfully'
  });
});

// GET with pagination
export const getItemsPaginated = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const total = await Item.countDocuments();
  const items = await Item.find()
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
  return ApiResponse.paginated(res, {
    data: items,
    page,
    limit,
    total
  });
});

// POST - Create resource
export const createItem = asyncHandler(async (req, res) => {
  const item = await Item.create(req.body);
  Logger.success('Item created', { id: item._id });
  
  return ApiResponse.created(res, { 
    data: item,
    message: 'Item created successfully'
  });
});

// PUT - Update resource
export const updateItem = asyncHandler(async (req, res) => {
  const item = await Item.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!item) {
    throw new AppError('Item not found', 404);
  }
  
  return ApiResponse.success(res, { 
    data: item,
    message: 'Item updated successfully'
  });
});

// DELETE - Remove resource
export const deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findByIdAndDelete(req.params.id);
  
  if (!item) {
    throw new AppError('Item not found', 404);
  }
  
  Logger.info('Item deleted', { id: req.params.id });
  return ApiResponse.success(res, { 
    message: 'Item deleted successfully'
  });
});
```

### Backend Route Pattern
```javascript
import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import { 
  createItemValidation,
  updateItemValidation,
  itemIdValidation
} from '../validators/itemValidators.js';
import validate from '../middleware/validate.js';
import { 
  getItems,
  createItem,
  updateItem,
  deleteItem
} from '../controllers/itemController.js';

const router = express.Router();

// Public routes
router.get('/', getItems);

// Protected routes
router.use(protect); // All routes below require authentication

router.post('/', createItemValidation, validate, createItem);

// Admin only routes
router.use(restrictTo('admin')); // All routes below require admin role

router.put('/:id', itemIdValidation, updateItemValidation, validate, updateItem);
router.delete('/:id', itemIdValidation, validate, deleteItem);

export default router;
```

### Validator Pattern
```javascript
import { body, param, query } from 'express-validator';

export const createItemValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }),
    
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0.01 }).withMessage('Price must be positive'),
    
  body('category')
    .trim()
    .notEmpty()
    .isIn(['Category1', 'Category2']).withMessage('Invalid category')
];

export const updateItemValidation = [
  param('id').isMongoId().withMessage('Invalid ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }),
    
  body('price')
    .optional()
    .isFloat({ min: 0.01 })
];

export const itemIdValidation = [
  param('id').isMongoId().withMessage('Invalid ID')
];

export const itemQueryValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim().isLength({ max: 100 })
];
```

### Frontend Service Pattern
```javascript
import api from './api';

const itemService = {
  // GET all
  getItems: async (params = {}) => {
    const response = await api.get('/items', { params });
    return response.data.data;
  },
  
  // GET by ID
  getItemById: async (id) => {
    const response = await api.get(`/items/${id}`);
    return response.data.data;
  },
  
  // POST - Create
  createItem: async (itemData) => {
    const response = await api.post('/items', itemData);
    return response.data.data;
  },
  
  // PUT - Update
  updateItem: async (id, itemData) => {
    const response = await api.put(`/items/${id}`, itemData);
    return response.data.data;
  },
  
  // DELETE
  deleteItem: async (id) => {
    const response = await api.delete(`/items/${id}`);
    return response.data;
  }
};

export default itemService;
```

### Frontend Component Pattern (React Query)
```javascript
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import itemService from '../services/itemService';

function ItemsPage() {
  const queryClient = useQueryClient();
  
  // Fetch data
  const { data: items, isLoading, error } = useQuery(
    'items',
    itemService.getItems
  );
  
  // Create mutation
  const createMutation = useMutation(itemService.createItem, {
    onSuccess: () => {
      queryClient.invalidateQueries('items');
      toast.success('Item created successfully');
      handleCloseModal();
    },
    onError: (error) => {
      // Error is already handled by interceptor
      console.error('Create failed:', error);
    }
  });
  
  // Update mutation
  const updateMutation = useMutation(
    ({ id, data }) => itemService.updateItem(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('items');
        toast.success('Item updated successfully');
      }
    }
  );
  
  // Delete mutation
  const deleteMutation = useMutation(itemService.deleteItem, {
    onSuccess: () => {
      queryClient.invalidateQueries('items');
      toast.success('Item deleted successfully');
    }
  });
  
  const handleCreate = (formData) => {
    createMutation.mutate(formData);
  };
  
  const handleUpdate = (id, formData) => {
    updateMutation.mutate({ id, data: formData });
  };
  
  const handleDelete = (id) => {
    if (confirm('Are you sure?')) {
      deleteMutation.mutate(id);
    }
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading items</div>;
  
  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
}
```

### Frontend Form Validation Pattern
```javascript
import { useState } from 'react';
import { validateForm, productFormValidator } from '../utils/validation';

function ProductForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: ''
  });
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const { isValid, errors: validationErrors } = validateForm(
      formData,
      productFormValidator
    );
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    
    // Submit
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

## 🎯 Response Codes

| Code | Method | Description |
|------|--------|-------------|
| 200 | success() | OK - Request successful |
| 201 | created() | Created - Resource created |
| 204 | noContent() | No Content - Successful, no data |
| 400 | badRequest() | Bad Request - Invalid input |
| 401 | unauthorized() | Unauthorized - Not authenticated |
| 403 | forbidden() | Forbidden - No permission |
| 404 | notFound() | Not Found - Resource doesn't exist |
| 409 | conflict() | Conflict - Duplicate resource |
| 422 | validationError() | Validation Error - Invalid data |
| 429 | - | Too Many Requests - Rate limited |
| 500 | error() | Internal Server Error |

## 🔒 Security Checklist

### Every Controller Should:
- [ ] Use `asyncHandler` wrapper
- [ ] Return `ApiResponse` methods
- [ ] Validate IDs are valid MongoDB ObjectIds
- [ ] Check resource ownership
- [ ] Log important actions

### Every Route Should:
- [ ] Have input validation
- [ ] Use `validate` middleware
- [ ] Use `protect` for authenticated routes
- [ ] Use `restrictTo` for role-based routes
- [ ] Have appropriate rate limiting

### Every Form Should:
- [ ] Validate on submit
- [ ] Display error messages
- [ ] Clear errors on input change
- [ ] Sanitize input
- [ ] Disable submit during loading

## 📝 Logging Best Practices

```javascript
import { Logger } from '../utils/logger.js';

// Information
Logger.info('User logged in', { userId: user._id });

// Success
Logger.success('Order placed', { orderId: order._id, amount: order.total });

// Warning
Logger.warn('Low stock alert', { productId, quantity });

// Error
Logger.error('Payment failed', error);

// Debug (development only)
Logger.debug('Query result', { count: results.length });
```

## 🧪 Testing API with curl

```bash
# Health check
curl http://localhost:5000/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"Test@1234","confirmPassword":"Test@1234"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@1234"}'

# Get products (authenticated)
curl http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create product (admin only)
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"Test Oil","category":"Vegetable Oil","basePrice":25.99,"unit":"Liter"}'
```

## 🎨 Common Validation Rules

```javascript
// Email
body('email').trim().isEmail().normalizeEmail()

// Password
body('password')
  .isLength({ min: 8 })
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)

// MongoDB ID
param('id').isMongoId()

// Number range
body('price').isFloat({ min: 0.01, max: 999999 })

// Enum values
body('status').isIn(['active', 'inactive', 'pending'])

// Date
body('date').isISO8601()

// URL
body('website').optional().isURL()

// Phone
body('phone').optional().matches(/^[\d\s\-\+\(\)]+$/)

// Custom validator
body('confirmPassword').custom((value, { req }) => {
  if (value !== req.body.password) {
    throw new Error('Passwords do not match');
  }
  return true;
})
```

---

**Pro Tip**: Copy these patterns when creating new features to maintain consistency!
