import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import CounselingService from '../services/counselingService';
const counselingService = new CounselingService();
import { ProtectedRequest } from '../middleware/authMiddleware';

const getUserId = (req: ProtectedRequest): string => {
  if (!req.user) {
    throw new Error('User not found in request.');
  }
  return req.user.id;
};

export const getHistory = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const userId = getUserId(req);
  const history = await counselingService.getHistory(userId);
  res.status(200).json(history);
});

export const postMessage = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const userId = getUserId(req);
  const { message } = req.body;
  const response = await counselingService.postMessage(userId, message);
  res.status(200).json(response);
});