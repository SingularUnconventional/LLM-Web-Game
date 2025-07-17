import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import GameService from '../services/gameService'; // Import class
import { ProtectedRequest } from '../middleware/authMiddleware';
import PsychologyAnswer from '../models/PsychologyAnswer';

const gameService = new GameService(); // Instantiate service

export const submitAnswers = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const userId = req.user!.id;
  const { answers } = req.body; // answers: { questionId: number, value: string }[]

  // 1. Save the answers to the database
  const answerDocs = answers.map((ans: { question: string, answer: string }) => ({
    userId,
    question: ans.question,
    answer: ans.answer,
  }));
  await PsychologyAnswer.insertMany(answerDocs);

  // 2. Trigger the game logic to process answers and generate the next character
  const result = await gameService.processPsychologyAndStartNight(userId, answers);

  res.status(200).json(result);
});