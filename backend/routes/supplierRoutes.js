import express from 'express';
import {
  addSupplier,
  updateSupplier,
  getAllSuppliers,
  getSupplier,
  linkProductsToSupplier,
  removeProductsFromSupplier,
  deleteSupplier,
  getSuppliersByProduct,
  getSupplierStats
} from '../controllers/supplierController.js';
import { protect, isAdmin } from '../middleware/auth.js';
import {
  validateAddSupplier,
  validateUpdateSupplier,
  validateLinkProducts,
  validateSupplierId,
  validateProductId
} from '../middleware/supplierValidation.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect, isAdmin);

// Supplier CRUD
router.post('/', validateAddSupplier, addSupplier);
router.get('/', getAllSuppliers);
router.get('/stats', getSupplierStats);
router.get('/:id', validateSupplierId, getSupplier);
router.put('/:id', validateUpdateSupplier, updateSupplier);
router.delete('/:id', validateSupplierId, deleteSupplier);

// Product linking
router.put('/:id/products', validateLinkProducts, linkProductsToSupplier);
router.delete('/:id/products', validateLinkProducts, removeProductsFromSupplier);

// Get suppliers by product
router.get('/product/:productId', validateProductId, getSuppliersByProduct);

export default router;
