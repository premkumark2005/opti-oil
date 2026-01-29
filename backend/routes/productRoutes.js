import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getCategories,
  getBrands,
  getProductStats
} from '../controllers/productController.js';
import { protect, isAdmin, isWholesaler } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductId,
  validateCategory
} from '../middleware/productValidation.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Public catalog routes (for authenticated users)
router.get('/', getProducts);
router.get('/categories/list', getCategories);
router.get('/brands/list', getBrands);
router.get('/category/:category', validateCategory, getProductsByCategory);
router.get('/:id', validateProductId, getProduct);

// Admin only routes
router.post('/', isAdmin, upload.single('image'), validateCreateProduct, createProduct);
router.put('/:id', isAdmin, upload.single('image'), validateUpdateProduct, updateProduct);
router.delete('/:id', isAdmin, validateProductId, deleteProduct);
router.get('/stats/overview', isAdmin, getProductStats);

export default router;
