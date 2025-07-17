import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';

// @desc    Submit answers for psychology questions
// @route   POST /api/psychology/answers
// @access  Private
export const submitPsychologyAnswers = asyncHandler(async (req: Request, res: Response) => {
  // 1. Get user and answers from request
  // 2. Save answers to PsychologyAnswer model
  // 3. (Async) Trigger the background process for night preparation:
  //    - Call AI-6 to update player analysis and get next character core problem
  //    - Call AI-7 to generate new character
  //    - Call AI-8 to generate image, then pixelate it
  //    - Save the new character to DB
  // 4. Respond with success message immediately. The client will poll for readiness.
  res.status(200).json({ message: 'Answers submitted. Preparing for the night.' });
});