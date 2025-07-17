import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import GameService from '../services/gameService';
import { ProtectedRequest } from '../middleware/authMiddleware'; // Added import

const gameService = new GameService(); // Instantiated GameService

const getUserId = (req: ProtectedRequest): string => {
  // authMiddleware should ensure req.user is populated.
  if (!req.user) {
    throw new Error('User not found in request. Authentication might have failed.');
  }
  return req.user.id;
};

export const startGame = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const userId = getUserId(req);
  const result = await gameService.startGame(userId);
  res.status(200).json(result);
});

export const submitInitialCounseling = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const userId = getUserId(req);
  const result = await gameService.submitInitialCounseling(userId, req.body.log);
  res.status(200).json(result);
});

export const postChatMessage = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const userId = getUserId(req);
  const result = await gameService.postChatMessage(userId, req.body.message);
  res.status(200).json(result);
});

export const endCharacterStory = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const userId = getUserId(req);
  const result = await gameService.endCharacterStory(userId);
  res.status(200).json(result);
});

export const skipToMorning = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const userId = getUserId(req);
  const result = await gameService.skipToMorning(userId); // Call on instance
  res.status(200).json(result);
});

export const skipToNight = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const userId = getUserId(req);
  const result = await gameService.skipToNight(userId); // Call on instance
  res.status(200).json(result);
});

export const startPsychologyPhase = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const userId = getUserId(req);
  const result = await gameService.startPsychologyPhase(userId);
  res.status(200).json(result);
});
