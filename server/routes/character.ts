import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import * as characterController from '../controllers/characterController';

const router = express.Router();

// 현재 게임 상태(진행일, 낮/밤 등) 조회
router.get('/state', authMiddleware, characterController.getGameState);

// 현재 대화 중인 캐릭터 정보 조회
router.get('/current', authMiddleware, characterController.getCurrentCharacter);

// 현재 캐릭터와의 대화 기록 조회
router.get('/history', authMiddleware, characterController.getConversationHistory);

// 획득한 모든 캐릭터 카드 목록 조회
router.get('/cards', authMiddleware, characterController.getCharacterCards);

// 획득한 모든 감정 조각 목록 조회
router.get('/emotion-pieces', authMiddleware, characterController.getEmotionPieces);

export default router;
