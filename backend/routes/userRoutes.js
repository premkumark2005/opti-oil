import express from 'express';
import { isAdmin, protect } from '../middleware/auth.js';
import {
  getAllWholesalers,
  updateWholesalerStatus
} from '../controllers/userController.js';

const router = express.Router();

// Admin routes
router.get('/wholesalers', protect, isAdmin, getAllWholesalers);
router.put('/:id/status', protect, isAdmin, updateWholesalerStatus);

export default router;
