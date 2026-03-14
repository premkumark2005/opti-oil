import express from 'express';
import {
  getAllRawMaterialInventory,
  getRawMaterialInventoryById,
  stockIn,
  stockOut,
  adjustInventory,
  updateReorderLevel,
  getLowStockRawMaterials,
  getInventoryStats,
  getInventoryTransactions
} from '../controllers/rawMaterialInventoryController.js';
import { protect, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect, authorize(USER_ROLES.ADMIN));

// Statistics and special queries
router.get('/stats/overview', getInventoryStats);
router.get('/low-stock', getLowStockRawMaterials);

// CRUD operations
router.get('/', getAllRawMaterialInventory);
router.get('/:id', getRawMaterialInventoryById);
router.get('/:id/transactions', getInventoryTransactions);

// Stock operations
router.post('/:id/stock-in', stockIn);
router.post('/:id/stock-out', stockOut);
router.post('/:id/adjust', adjustInventory);
router.put('/:id/reorder-level', updateReorderLevel);

export default router;
