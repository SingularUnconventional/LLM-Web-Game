import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import gameService from '../services/gameService';
import { ProtectedRequest } from '../middleware/authMiddleware';

const getUserId = (req: Request): string => {
  // authMiddleware should ensure req.user is populated.
  const protectedReq = req as ProtectedRequest;
  if (!protectedReq.user) {
    throw new Error('User not found in request. Authentication might have failed.');
  }
  return protectedReq.user.id;
};

export const startGame = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const result = await gameService.startGame(userId);
  res.status(200).json(result);
});

export const submitInitialCounseling = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const result = await gameService.submitInitialCounseling(userId, req.body.log);
  res.status(200).json(result);
});

export const postChatMessage = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const result = await gameService.postChatMessage(userId, req.body.message);
  res.status(200).json(result);
});

export const endCharacterStory = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const result = await gameService.endCharacterStory(userId);
  res.status(200).json(result);
});

export const skipToMorning = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const result = await gameService.skipToMorning(userId);
  res.status(200).json(result);
});

export const skipToNight = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const result = await gameService.skipToNight(userId);
  res.status(200).json(result);
});
