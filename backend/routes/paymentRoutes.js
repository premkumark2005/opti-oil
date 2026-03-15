import express from 'express';
import { verifyPayment, createSupplierPayout, createExistingOrderPayment } from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

// Wholesaler routes
router.post('/verify', protect, authorize(USER_ROLES.WHOLESALER), verifyPayment);
router.post('/order/:id', protect, authorize(USER_ROLES.WHOLESALER), createExistingOrderPayment);

// Admin routes
router.post('/supplier', protect, authorize(USER_ROLES.ADMIN), createSupplierPayout);

export default router;
