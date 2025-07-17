import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getHistory, postMessage } from '../controllers/counselingController';

const router = express.Router();

router.get('/history', authMiddleware, getHistory);
router.post('/message', authMiddleware, postMessage);

export default router;