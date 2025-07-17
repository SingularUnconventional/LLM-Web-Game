import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { submitPsychologyAnswers } from '../controllers/psychologyController';

const router = express.Router();

// 심리 질문 답변 제출
router.post('/answers', authMiddleware, submitPsychologyAnswers);

export default router;
