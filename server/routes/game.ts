import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  startGame,
  submitInitialCounseling,
  postChatMessage,
  endCharacterStory,
  skipToMorning,
  skipToNight,
  startPsychologyPhase,
} from '../controllers/gameController';

const router = express.Router();

router.get('/start', authMiddleware, startGame);
router.post('/initial-counseling', authMiddleware, submitInitialCounseling);
router.post('/chat', authMiddleware, postChatMessage);
router.post('/end-story', authMiddleware, endCharacterStory);
router.post('/skip-morning', authMiddleware, skipToMorning);
router.post('/skip-night', authMiddleware, skipToNight);
router.post('/start-psychology', authMiddleware, startPsychologyPhase);

export default router;
