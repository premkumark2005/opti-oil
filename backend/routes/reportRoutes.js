import express from 'express';
import {
  getInventoryStatusReport,
  getLowStockReport,
  getOrderSummaryReport,
  getProductPerformanceReport
} from '../controllers/reportController.js';
import { protect, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// All report routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

/**
 * Inventory Reports
 */
router.get('/inventory-status', getInventoryStatusReport);
router.get('/low-stock', getLowStockReport);

/**
 * Order Reports
 */
router.get('/order-summary', getOrderSummaryReport);

/**
 * Product Reports
 */
router.get('/product-performance', getProductPerformanceReport);

export default router;
