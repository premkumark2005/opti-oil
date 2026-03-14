import express from 'express';
import {
  getAllSupplierUsers,
  getSupplierUserById,
  approveSupplierUser,
  rejectSupplierUser,
  toggleSupplierUserStatus,
  deleteSupplierUser,
  getSupplierUserStats
} from '../controllers/adminSupplierUserController.js';
import { protect, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect, authorize(USER_ROLES.ADMIN));

// Statistics
router.get('/stats/overview', getSupplierUserStats);

// CRUD operations
router.get('/', getAllSupplierUsers);
router.get('/:id', getSupplierUserById);
router.put('/:id/approve', approveSupplierUser);
router.put('/:id/reject', rejectSupplierUser);
router.put('/:id/toggle-status', toggleSupplierUserStatus);
router.delete('/:id', deleteSupplierUser);

export default router;
