import express from 'express';
import { processQuery } from '../controllers/chatbotController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All chatbot endpoints require authentication so we can detect role
router.use(protect);

router.post('/query', processQuery);

export default router;
