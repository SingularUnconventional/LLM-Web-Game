import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { submitAnswers } from '../controllers/psychologyController';

const router = express.Router();

// 심리 질문 답변 제출
router.post('/answers', authMiddleware, submitAnswers);

export default router;
