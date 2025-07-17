import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import User from '../models/User';
import Character from '../models/Character';
import GameState from '../models/GameState';
import ConversationLog from '../models/ConversationLog';
import CharacterCard from '../models/CharacterCard';
import EmotionPiece from '../models/EmotionPiece';
import geminiService from '../services/geminiService';
import promptService from '../services/promptService'; // Added import
import { ProtectedRequest } from '../middleware/authMiddleware'; // Added import

// @desc    Generate 3 initial characters based on user's initial analysis
// @route   POST /api/character/initial
// @access  Private
export const generateInitialCharacters = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const userId = req.user!.id; // Used ProtectedRequest and non-null assertion

  const user = await User.findById(userId);
  if (!user || !user.playerAnalysis || !user.playerAnalysis.coreProblem) {
    res.status(400);
    throw new Error('초기 상담 분석 결과가 없습니다. 먼저 초기 상담을 완료해주세요.');
  }

  const { coreProblem } = user.playerAnalysis;

  // 3개의 캐릭터 프로필 생성을 병렬로 요청
  const characterPromises = Array(3).fill(null).map(() =>
    geminiService.generateJson(promptService.getPrompt('fairy_tale_character_generation_prompt', { coreProblem }))
  );

  const characterProfiles = await Promise.all(characterPromises);

  // 각 캐릭터의 이미지 생성을 병렬로 요청
  const imagePromises = characterProfiles.map(profile =>
    geminiService.generateImage(profile.description)
  );
  const imageUrls = await Promise.all(imagePromises);

  // 캐릭터 데이터와 이미지 URL을 결합하여 DB에 저장할 객체 생성
  const charactersToCreate = characterProfiles.map((profile, index) => ({
    ...profile,
    userId,
    originalImageUrl: imageUrls[index],
    // TODO: Implement pixelation logic later
    pixelatedImageUrl: imageUrls[index],
    isFixed: false,
    isFinalPersona: false,
  }));

  // DB에 캐릭터 일괄 저장
  const newCharacters = await Character.insertMany(charactersToCreate);

  res.status(201).json(newCharacters);
});


// @desc    Get current game state
// @route   GET /api/character/state
// @access  Private
export const getGameState = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  // Find GameState for the user
  res.status(200).json({ message: 'Game state fetched' });
});

// @desc    Select a character to start conversation
// @route   POST /api/character/select
// @access  Private
export const selectCharacter = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { characterId } = req.body;
  const userId = req.user!.id; // Used ProtectedRequest and non-null assertion

  if (!characterId) {
    res.status(400);
    throw new Error('캐릭터 ID가 필요합니다.');
  }

  const character = await Character.findOne({ _id: characterId, userId });
  if (!character) {
    res.status(404);
    throw new Error('캐릭터를 찾을 수 없거나 권한이 없습니다.');
  }

  // Find or create a GameState for the user
  let gameState = await GameState.findOne({ userId });
  if (!gameState) {
    gameState = new GameState({ userId });
  }

  // Set the active character
  gameState.activeCharacterId = character._id.toString(); // Converted to string
  gameState.lastInteractionTime = new Date();
  await gameState.save();

  res.status(200).json({
    message: `'${character.name}' 캐릭터를 선택했습니다.`,
    activeCharacterId: gameState.activeCharacterId,
  });
});

// @desc    Post a message to the active character
// @route   POST /api/character/message
// @access  Private
export const postCharacterMessage = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { message } = req.body;
  const userId = req.user!.id; // Used ProtectedRequest and non-null assertion

  if (!message) {
    res.status(400);
    throw new Error('메시지 내용이 필요합니다.');
  }

  // 1. Get active character from GameState
  const gameState = await GameState.findOne({ userId });
  if (!gameState || !gameState.activeCharacterId) {
    res.status(400);
    throw new Error('현재 대화 중인 캐릭터가 없습니다. 먼저 캐릭터를 선택해주세요.');
  }
  const { activeCharacterId, currentDay } = gameState;

  // 2. Save user's message
  const userMessage = new ConversationLog({
    characterId: activeCharacterId,
    speaker: 'user',
    message,
    gameDay: currentDay,
  });
  await userMessage.save();

  // 3. Get character info and conversation history
  const character = await Character.findById(activeCharacterId);
  if (!character) {
    res.status(404);
    throw new Error('대화 상대를 찾을 수 없습니다.');
  }

  const history = await ConversationLog.find({ characterId: activeCharacterId }).sort({ timestamp: 1 });
  const formattedHistory = history.map(log => ({
    role: log.speaker === 'user' ? 'user' : 'model',
    parts: [{ text: log.message }],
  }));

  // 4. Get AI response
  const prompt = promptService.getPrompt('character_dialogue_prompt', {
    character_profile: character.toObject(),
    conversation_history: formattedHistory.map(entry => `${entry.role === 'user' ? '플레이어' : '캐릭터'}: ${entry.parts[0].text}`).join('\n'),
    player_input: message,
  });

  const aiResponse = await geminiService.generateText(prompt);

  // 5. Save AI's message
  const characterMessage = new ConversationLog({
    characterId: activeCharacterId,
    speaker: 'character',
    message: aiResponse,
    gameDay: currentDay,
  });
  await characterMessage.save();

  // 6. Send AI response to client
  res.status(201).json({ message: aiResponse });
});

// @desc    End conversation with the active character and analyze the result
// @route   POST /api/character/end-conversation
// @access  Private
export const endConversation = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const userId = req.user!.id; // Used ProtectedRequest and non-null assertion

  // 1. Get active character from GameState
  const gameState = await GameState.findOne({ userId });
  if (!gameState || !gameState.activeCharacterId) {
    res.status(400);
    throw new Error('현재 대화 중인 캐릭터가 없습니다.');
  }
  const { activeCharacterId } = gameState;

  // 2. Get character and conversation log
  const character = await Character.findById(activeCharacterId);
  const logs = await ConversationLog.find({ characterId: activeCharacterId }).sort({ timestamp: 'asc' });
  if (!character || logs.length === 0) {
    res.status(404);
    throw new Error('캐릭터 또는 대화 기록을 찾을 수 없습니다.');
  }

  const conversationLogText = logs.map(log => `${log.speaker}: ${log.message}`).join('\n');

  // 3. Summarize conversation and get outcome
  const summaryPrompt = promptService.getPrompt('conversation_summary_prompt', {
    character_profile: character.toObject(),
    conversation_log: conversationLogText,
  });
  const { summary, outcome } = await geminiService.generateJson(summaryPrompt);

  let newCard = null;
  let newEmotionPieces = [];

  // 4. If conversation was successful, create card and emotion pieces
  if (outcome === '성공') {
    // Update character status
    character.isFixed = true;
    await character.save();

    // Create Character Card
    newCard = new CharacterCard({
      userId,
      characterId: character._id.toString(), // Converted to string
      summary,
      outcome,
      pixelatedImageUrl: character.pixelatedImageUrl, // Use existing image
    });
    await newCard.save();

    // Extract emotion keywords
    const emotionPrompt = promptService.getPrompt('emotion_keyword_extraction_prompt', { summary, outcome });
    const { keywords } = await geminiService.generateJson(emotionPrompt);

    // Create Emotion Pieces
    const emotionPiecesToCreate = keywords.map((keyword: string) => ({
      userId,
      characterCardId: newCard!._id.toString(), // Used non-null assertion and converted to string
      keyword,
    }));
    if (emotionPiecesToCreate.length > 0) {
        newEmotionPieces = await EmotionPiece.insertMany(emotionPiecesToCreate);
    }
  }

  // 5. Update GameState
  gameState.activeCharacterId = null;
  await gameState.save();

  // 6. Respond to client
  res.status(200).json({
    message: '대화가 종료되었습니다.',
    outcome,
    summary,
    newCard,
    newEmotionPieces,
  });
});

// @desc    Get unselected initial characters
// @route   GET /api/character/unselected
// @access  Private
export const getUnselectedCharacters = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const userId = req.user!.id; // Used ProtectedRequest and non-null assertion

  // A character is considered "unselected" if they haven't been "fixed" yet.
  // This assumes that once a conversation starts, the character might be selected,
  // but only after a successful conversation they are "fixed".
  // A simpler rule for now: find all non-fixed characters.
  const characters = await Character.find({ userId, isFixed: false });

  res.status(200).json(characters);
});

// @desc    Get a single character by its ID
// @route   GET /api/character/:id
// @access  Private
export const getCharacterById = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id; // Used ProtectedRequest and non-null assertion

  const character = await Character.findOne({ _id: id, userId });

  if (!character) {
    res.status(404);
    throw new Error('캐릭터를 찾을 �� 없습니다.');
  }

  res.status(200).json(character);
});

// @desc    Finalize the player's persona
// @route   POST /api/character/finalize-persona
// @access  Private
export const finalizePersona = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const userId = req.user!.id; // Used ProtectedRequest and non-null assertion

  // 1. Gather all necessary data
  const user = await User.findById(userId);
  const cards = await CharacterCard.find({ userId });
  const pieces = await EmotionPiece.find({ userId });
  // For logs, we'll fetch all conversation logs for this user.
  // A more optimized way would be to link logs to the user directly.
  const characterIds = (await Character.find({ userId })).map(c => c._id);
  const logs = await ConversationLog.find({ characterId: { $in: characterIds } }).sort({ timestamp: 'asc' });

  if (cards.length < 3) { // Assuming 3 initial characters need to be completed
    res.status(400);
    throw new Error('모든 초기 캐릭터와의 여정을 마쳐야 최종 페르소나를 생성할 수 있습니다.');
  }

  // 2. Format data for the prompt
  const finalPlayerAnalysis = {
    initialAnalysis: user?.playerAnalysis,
    completedPersonas: cards.map(c => ({ summary: c.summary, outcome: c.outcome })),
    collectedEmotions: pieces.map(p => p.keyword),
  };
  const allConversationLogs = logs.map(log => `${log.speaker}: ${log.message}`).join('\n');

  // 3. Call Gemini Service to generate the final persona profile
  const personaProfile = await geminiService.generateJson(promptService.getPrompt('final_persona_generation_prompt', {
    finalPlayerAnalysis,
    allConversationLogs,
  }));

  // 4. Generate a new image for the final persona
  const imageUrl = await geminiService.generateImage(personaProfile.description);

  // 5. Create and save the new final persona character
  const finalPersona = new Character({
    ...personaProfile,
    userId,
    originalImageUrl: imageUrl,
    pixelatedImageUrl: imageUrl, // Final persona might not need pixelation
    isFixed: true,
    isFinalPersona: true,
  });
  await finalPersona.save();

  res.status(201).json(finalPersona);
});

// @desc    Get current active character
// @route   GET /api/character/current
// @access  Private
export const getCurrentCharacter = asyncHandler(async (req: Request, res: Response) => {
  // Find current active character from GameState
  res.status(200).json({ message: 'Current character fetched' });
});

// @desc    Get conversation history for the current character
// @route   GET /api/character/history
// @access  Private
export const getConversationHistory = asyncHandler(async (req: Request, res: Response) => {
  // Find all conversation logs for the active character
  res.status(200).json({ message: 'Conversation history fetched' });
});

// @desc    Get all collected character cards
// @route   GET /api/character/cards
// @access  Private
export const getCharacterCards = asyncHandler(async (req: Request, res: Response) => {
  const cards = await CharacterCard.find({ userId: req.user.id });
  res.status(200).json(cards);
});

// @desc    Get all collected emotion pieces
// @route   GET /api/character/emotion-pieces
// @access  Private
export const getEmotionPieces = asyncHandler(async (req: Request, res: Response) => {
  const pieces = await EmotionPiece.find({ userId: req.user.id });
  res.status(200).json(pieces);
});
