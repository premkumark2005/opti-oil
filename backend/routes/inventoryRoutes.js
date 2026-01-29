import express from 'express';
import {
  stockIn,
  stockOut,
  getProductInventory,
  getAllInventory,
  getLowStockProducts,
  updateReorderLevel,
  getInventoryTransactions,
  adjustInventory
} from '../controllers/inventoryController.js';
import { protect, isAdmin } from '../middleware/auth.js';
import {
  validateStockIn,
  validateStockOut,
  validateReorderLevel,
  validateInventoryAdjustment
} from '../middleware/inventoryValidation.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Stock operations (Admin only)
router.post('/stock-in', isAdmin, validateStockIn, stockIn);
router.post('/stock-out', isAdmin, validateStockOut, stockOut);
router.post('/adjust', isAdmin, validateInventoryAdjustment, adjustInventory);

// Inventory queries
router.get('/', getAllInventory);
router.get('/low-stock', isAdmin, getLowStockProducts);
router.get('/product/:productId', getProductInventory);
router.get('/transactions', isAdmin, getInventoryTransactions);

// Update operations (Admin only)
router.put('/:id/reorder-level', isAdmin, validateReorderLevel, updateReorderLevel);

export default router;
