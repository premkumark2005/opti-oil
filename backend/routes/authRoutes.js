import express from 'express';
import {
  registerWholesaler,
  login,
  adminLogin,
  approveWholesaler,
  getMe,
  getPendingWholesalers,
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import { protect, isAdmin } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validateApproval,
  validateProfileUpdate,
  validatePasswordChange
} from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, registerWholesaler);
router.post('/login', validateLogin, login);
router.post('/admin/login', validateLogin, adminLogin);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, validateProfileUpdate, updateProfile);
router.put('/change-password', protect, validatePasswordChange, changePassword);

// Admin only routes
router.get('/wholesalers/pending', protect, isAdmin, getPendingWholesalers);
router.put('/wholesaler/:id/approve', protect, isAdmin, validateApproval, approveWholesaler);

export default router;
