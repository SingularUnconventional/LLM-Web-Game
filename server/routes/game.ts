import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  startGame,
  submitInitialCounseling,
  postChatMessage,
  endCharacterStory,
  skipToMorning,
  skipToNight,
} from '../controllers/gameController';

const router = express.Router();

// 최초 로그인 시, 또는 재시작 시 게임 시작 (초기 상담 or 첫 캐릭터 로드)
router.post('/start', authMiddleware, startGame);

// 최초 상담 내용 제출 및 분석 요청
router.post('/initial-counseling', authMiddleware, submitInitialCounseling);

// 캐릭터와 대화 메시지 전송
router.post('/chat', authMiddleware, postChatMessage);

// 현재 캐릭터 이야기 종료 및 요약/카드 생성 요청
router.post('/end-story', authMiddleware, endCharacterStory);

// 시간 스킵
router.post('/skip/morning', authMiddleware, skipToMorning);
router.post('/skip/night', authMiddleware, skipToNight);

export default router;
