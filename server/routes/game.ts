import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { startGame, handleTurn } from '../controllers/gameController';

const router = express.Router();

/**
 * @route   POST /api/game/start
 * @desc    심리 테스트 결과로 게임 시작
 * @access  Private
 */
router.post('/start', authMiddleware, startGame);

/**
 * @route   POST /api/game/:characterId/turn
 * @desc    캐릭터와 대화 턴 진행
 * @access  Private
 */
router.post('/:characterId/turn', authMiddleware, handleTurn);

export default router;