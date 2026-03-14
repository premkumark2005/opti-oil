import express from 'express';
import {
  registerSupplier,
  loginSupplier,
  getSupplierProfile,
  updateSupplierProfile,
  changeSupplierPassword
} from '../controllers/supplierAuthController.js';
import { protect, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

// Public routes
router.post('/register', registerSupplier);
router.post('/login', loginSupplier);

// Protected routes (Supplier only)
router.get('/me', protect, authorize(USER_ROLES.SUPPLIER), getSupplierProfile);
router.put('/profile', protect, authorize(USER_ROLES.SUPPLIER), updateSupplierProfile);
router.put('/change-password', protect, authorize(USER_ROLES.SUPPLIER), changeSupplierPassword);

export default router;
