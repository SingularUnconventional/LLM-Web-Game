import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as gameService from '../services/gameService';
import { ProtectedRequest } from '../middleware/authMiddleware';

/**
 * 심리 테스트 결과를 제출하고 게임을 시작합니다.
 */
export const startGame = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const userId = req.user!._id;
  const { testResult } = req.body; // testResult: string

  if (!testResult) {
    return res.status(400).json({ message: '심리 테스트 결과가 필요합니다.' });
  }

  const result = await gameService.startGameWithTestResult(userId, testResult);
  res.status(201).json(result);
});

/**
 * 사용자의 메시지를 받아 턴을 진행합니다.
 */
export const handleTurn = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { characterId } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: '메시지 내용이 필요합니다.' });
  }

  const result = await gameService.processTurn(characterId, message);

  if (result.isEnding) {
    // 엔딩이 발생한 경우
    res.status(200).json({
      message: 'Ending has been reached.',
      ...result,
    });
  } else {
    // 일반적인 대화 턴
    res.status(200).json({
      message: 'Turn processed successfully.',
      ...result,
    });
  }
});
