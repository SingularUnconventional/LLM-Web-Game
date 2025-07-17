import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import * as characterController from '../controllers/characterController';

const router = express.Router();

// 초기 캐릭터 3명 생성
router.post('/initial', authMiddleware, characterController.generateInitialCharacters);

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

// 대화할 캐릭터 선택
router.post('/select', authMiddleware, characterController.selectCharacter);

// 현재 활성화된 캐릭터와 대화 메시지 주고받기
router.post('/message', authMiddleware, characterController.postCharacterMessage);

// 현재 캐릭터와의 대화 종료 및 분석
router.post('/end-conversation', authMiddleware, characterController.endConversation);

// 아직 선택되지 않은 초기 캐릭터 목록 조회
router.get('/unselected', authMiddleware, characterController.getUnselectedCharacters);

// 특정 ID의 캐릭터 정보 조회
router.get('/:id', authMiddleware, characterController.getCharacterById);

// 최종 페르소나 생성
router.post('/finalize-persona', authMiddleware, characterController.finalizePersona);

export default router;
