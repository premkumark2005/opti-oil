import express from 'express';
import {
  placeOrder,
  approveOrder,
  rejectOrder,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  getMyOrders,
  getOrder,
  getPendingOrders,
  getOrderStats
} from '../controllers/orderController.js';
import { protect, isAdmin, isWholesaler } from '../middleware/auth.js';
import {
  validatePlaceOrder,
  validateRejectOrder,
  validateCancelOrder,
  validateUpdateStatus,
  validateOrderId
} from '../middleware/orderValidation.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Wholesaler routes
router.post('/', isWholesaler, validatePlaceOrder, placeOrder);
router.get('/my-orders', isWholesaler, getMyOrders);

// Admin routes
router.get('/pending', isAdmin, getPendingOrders);
router.get('/stats', isAdmin, getOrderStats);
router.get('/', isAdmin, getAllOrders);
router.put('/:id/approve', isAdmin, validateOrderId, approveOrder);
router.put('/:id/reject', isAdmin, validateRejectOrder, rejectOrder);
router.put('/:id/status', isAdmin, validateUpdateStatus, updateOrderStatus);

// Shared routes (with role-based access control in controller)
router.get('/:id', validateOrderId, getOrder);
router.put('/:id/cancel', validateCancelOrder, cancelOrder);

export default router;
