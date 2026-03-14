import express from 'express';
import {
  createRawMaterial,
  getAllRawMaterials,
  getRawMaterialById,
  updateRawMaterial,
  deleteRawMaterial,
  getRawMaterialStats
} from '../controllers/rawMaterialController.js';
import { protect, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Statistics (Supplier only)
router.get('/stats/overview', authorize(USER_ROLES.SUPPLIER), getRawMaterialStats);

// CRUD operations
router.post('/', authorize(USER_ROLES.SUPPLIER), createRawMaterial);
router.get('/', authorize(USER_ROLES.ADMIN, USER_ROLES.SUPPLIER), getAllRawMaterials);
router.get('/:id', authorize(USER_ROLES.ADMIN, USER_ROLES.SUPPLIER), getRawMaterialById);
router.put('/:id', authorize(USER_ROLES.SUPPLIER), updateRawMaterial);
router.delete('/:id', authorize(USER_ROLES.SUPPLIER), deleteRawMaterial);

export default router;
