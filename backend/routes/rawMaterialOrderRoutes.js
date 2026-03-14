import express from 'express';
import {
  createRawMaterialOrder,
  getAllRawMaterialOrders,
  getRawMaterialOrderById,
  updateOrderStatus,
  markOrderAsDelivered,
  getSupplierOrderStats,
  getAdminOrderStats
} from '../controllers/rawMaterialOrderController.js';
import { protect, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Statistics
router.get('/stats/overview', authorize(USER_ROLES.SUPPLIER), getSupplierOrderStats);
router.get('/admin/stats', authorize(USER_ROLES.ADMIN), getAdminOrderStats);

// Admin routes
router.post('/', authorize(USER_ROLES.ADMIN), createRawMaterialOrder);

// Shared routes
router.get('/', authorize(USER_ROLES.ADMIN, USER_ROLES.SUPPLIER), getAllRawMaterialOrders);
router.get('/:id', authorize(USER_ROLES.ADMIN, USER_ROLES.SUPPLIER), getRawMaterialOrderById);

// Supplier routes
router.put('/:id/status', authorize(USER_ROLES.SUPPLIER), updateOrderStatus);
router.put('/:id/deliver', authorize(USER_ROLES.SUPPLIER), markOrderAsDelivered);

export default router;
