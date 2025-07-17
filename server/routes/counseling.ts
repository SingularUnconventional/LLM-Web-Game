import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import * as counselingController from '../controllers/counselingController';

const router = express.Router();

// 수시 상담 시작 또는 기존 상담 기록 불러오기
router.get('/', authMiddleware, counselingController.startOrGetCounseling);

// 수시 상담 메시지 전송
router.post('/message', authMiddleware, counselingController.postCounselingMessage);

// 수시 상담 종료 및 분석 요청
router.post('/end', authMiddleware, counselingController.endCounselingSession);

export default router;
