import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';

// @desc    Start the game (initial counseling or load first character)
// @route   POST /api/game/start
// @access  Private
export const startGame = asyncHandler(async (req: Request, res: Response) => {
  // 1. Find user from req.user
  // 2. Check if user has playerAnalysis data
  // 3. If not, respond to start initial counseling
  // 4. If yes, load current game state and character
  res.status(200).json({ message: 'Game started' });
});

// @desc    Submit initial counseling log for analysis
// @route   POST /api/game/initial-counseling
// @access  Private
export const submitInitialCounseling = asyncHandler(async (req: Request, res: Response) => {
  // 1. Get user and counseling log from request
  // 2. Call AI-2 to analyze and create playerAnalysis
  // 3. Create the first fixed character (caterpillar)
  // 4. Create initial game state
  // 5. Respond with the first character's data
  res.status(200).json({ message: 'Initial counseling submitted' });
});

// @desc    Post a chat message to the current character
// @route   POST /api/game/chat
// @access  Private
export const postChatMessage = asyncHandler(async (req: Request, res: Response) => {
  // 1. Get user, message from request
  // 2. Get current character and conversation history
  // 3. Call AI-3 to get character's response
  // 4. Save user message and AI response to ConversationLog
  // 5. Respond with the character's new message
  res.status(200).json({ message: 'Message posted' });
});

// @desc    End the current character's story
// @route   POST /api/game/end-story
// @access  Private
export const endCharacterStory = asyncHandler(async (req: Request, res: Response) => {
  // 1. Get user and current character
  // 2. Call AI-4 to summarize the story -> Create CharacterCard
  // 3. Call AI-5 to extract emotion keywords -> Create EmotionPiece
  // 4. Update GameState to 'day'
  // 5. Respond with the new CharacterCard and EmotionPieces
  res.status(200).json({ message: 'Story ended' });
});

// @desc    Skip time to morning
// @route   POST /api/game/skip/morning
// @access  Private
export const skipToMorning = asyncHandler(async (req: Request, res: Response) => {
  // Logic to change timeOfDay to 'day'
  res.status(200).json({ message: 'Skipped to morning' });
});

// @desc    Skip time to night
// @route   POST /api/game/skip/night
// @access  Private
export const skipToNight = asyncHandler(async (req: Request, res: Response) => {
  // 1. Check if new character is ready
  // 2. Logic to change timeOfDay to 'night'
  // 3. Respond with new character data
  res.status(200).json({ message: 'Skipped to night' });
});
