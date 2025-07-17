import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';

// @desc    Start a new counseling session or get existing logs
// @route   GET /api/counseling
// @access  Private
export const startOrGetCounseling = asyncHandler(async (req: Request, res: Response) => {
  // Find all non-initial counseling logs for the user
  res.status(200).json({ message: 'Counseling session started or fetched' });
});

// @desc    Post a message in a counseling session
// @route   POST /api/counseling/message
// @access  Private
export const postCounselingMessage = asyncHandler(async (req: Request, res: Response) => {
  // 1. Get user, message from request
  // 2. Call AI-9 to get AI's response
  // 3. Save user message and AI response to CounselingLog
  // 4. Respond with the AI's new message
  res.status(200).json({ message: 'Counseling message posted' });
});

// @desc    End a counseling session and trigger analysis
// @route   POST /api/counseling/end
// @access  Private
export const endCounselingSession = asyncHandler(async (req: Request, res: Response) => {
  // 1. Get user and the latest counseling logs
  // 2. Call AI-10 to analyze the log and update playerAnalysis
  // 3. Respond with success message
  res.status(200).json({ message: 'Counseling session ended and analyzed' });
});
