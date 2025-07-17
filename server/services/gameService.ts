import User from '../models/User';
import GameState from '../models/GameState';
import Character from '../models/Character';
import ConversationLog from '../models/ConversationLog';
import CharacterCard from '../models/CharacterCard';
import EmotionPiece from '../models/EmotionPiece';
import promptService from './promptService';
import geminiService from './geminiService';

class GameService {
  async startGame(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (!user.playerAnalysis) {
      return { status: 'initial_counseling_needed' };
    }

    let gameState = await GameState.findOne({ userId });
    if (!gameState) {
      return { status: 'no_game_state_found' }; // Fallback
    }

    if (gameState.currentPhase === 'DAY_WAITING') {
      const now = new Date();
      const lastInteraction = gameState.lastInteractionTime;
      const hoursPassed = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);

      if (hoursPassed >= 12) {
        gameState.currentPhase = 'DAY_PSYCHOLOGY_TEST';
        await gameState.save();
        return { status: 'day_phase_psychology_test' };
      }

      return {
        status: 'day_phase_waiting',
        isSkipEnabled: hoursPassed >= 1,
        lastInteractionTime: gameState.lastInteractionTime,
      };
    }

    if (gameState.currentPhase === 'DAY_PSYCHOLOGY_TEST') {
      return { status: 'day_phase_psychology_test' };
    }
    
    if (gameState.currentPhase === 'FINAL_PERSONA_GENERATION') {
        return { status: 'night_phase_character_generation_pending' };
    }

    if (!gameState.activeCharacterId) {
      return { status: 'night_phase_character_generation_pending' };
    }

    const character = await Character.findById(gameState.activeCharacterId);
    const conversationHistory = await ConversationLog.find({ characterId: gameState.activeCharacterId }).sort({ timestamp: 1 });

    return {
      status: 'game_loaded',
      gameState,
      character,
      conversationHistory,
    };
  }

  async submitInitialCounseling(userId: string, log: any[]) {
    const counseling_log = log.map(l => `${l.speaker === 'user' ? '플레이어' : '상담가'}: ${l.message}`).join('\n');
    
    const prompt = promptService.getPrompt('initial_counseling_analysis_prompt', { counseling_log });
    const analysisResult = await geminiService.generateJson(prompt);

    const user = await User.findByIdAndUpdate(userId, { playerAnalysis: analysisResult }, { new: true });
    if (!user) throw new Error('User not found');

    const firstCharacter = new Character({
      userId,
      name: '애벌레',
      description: '곧 번데기가 되어야 하는 운명을 앞둔 작은 애벌레. 세상이 변하는 것이 두렵다.',
      problem: '번데기가 되고 싶지 않아요. 나비가 되는 게 정말 좋은 일일까요?',
      personality: '소심하고, 걱정이 많으며, 변화를 두려워함',
      initialDialogue: '곧... 나도 번데기가 되어야 한대. 모두들 나비가 되는 건 멋진 일이라고 하지만, 나는 그냥 이대로 계속 애벌레로 살고 싶은데... 이게 잘못된 생각일까?',
      isFixed: true,
    });
    await firstCharacter.save();

    const gameState = new GameState({
      userId,
      currentDay: 1,
      currentPhase: 'NIGHT_CONVERSATION',
      activeCharacterId: firstCharacter._id,
      lastInteractionTime: new Date(),
    });
    await gameState.save();

    return {
      status: 'counseling_completed',
      character: firstCharacter,
      gameState,
    };
  }

  async postChatMessage(userId: string, message: string) {
    const gameState = await GameState.findOne({ userId });
    if (!gameState || !gameState.activeCharacterId) throw new Error('Game state or active character not found.');

    const characterId = gameState.activeCharacterId;
    const gameDay = gameState.currentDay;

    const userMessage = new ConversationLog({ characterId, speaker: 'user', message, gameDay });
    await userMessage.save();

    const character = await Character.findById(characterId);
    if (!character) throw new Error('Character not found.');

    const conversationLogs = await ConversationLog.find({ characterId }).sort({ timestamp: -1 }).limit(20);
    const conversation_history = conversationLogs.reverse().map(log => 
      `${log.speaker === 'user' ? '플레이어' : character.name}: ${log.message}`
    ).join('\n');

    const prompt = promptService.getPrompt('character_dialogue_prompt', {
      character_profile: character.toObject(),
      conversation_history,
      player_input: message,
    });

    const aiResponse = await geminiService.generateText(prompt);

    const characterMessage = new ConversationLog({ characterId, speaker: 'character', message: aiResponse, gameDay });
    await characterMessage.save();

    return { message: aiResponse };
  }

  async endCharacterStory(userId: string) {
    const gameState = await GameState.findOne({ userId });
    if (!gameState || !gameState.activeCharacterId) throw new Error('Game state or active character not found.');
    
    const characterId = gameState.activeCharacterId;
    const character = await Character.findById(characterId);
    if (!character) throw new Error('Character not found.');

    // --- 1. Summarize Story (AI-4) ---
    const conversation_log = (await ConversationLog.find({ characterId }).sort({ timestamp: 1 }))
      .map(l => `${l.speaker === 'user' ? '플레이어' : character.name}: ${l.message}`).join('\n');
      
    const summaryPrompt = promptService.getPrompt('conversation_summary_prompt', {
      character_profile: character.toObject(),
      conversation_log,
    });
    const { summary, outcome } = await geminiService.generateJson(summaryPrompt);

    // --- 2. Extract Emotion Keywords (AI-5) ---
    const emotionPrompt = promptService.getPrompt('emotion_keyword_extraction_prompt', { summary, outcome });
    const { keywords } = await geminiService.generateJson(emotionPrompt);

    // --- 3. Save to DB ---
    const card = new CharacterCard({
      userId,
      characterId,
      summary,
      outcome,
      pixelatedImageUrl: character.pixelatedImageUrl,
    });
    await card.save();

    const emotionPieces = keywords.map((keyword: string) => ({
      characterCardId: card._id,
      keyword,
    }));
    await EmotionPiece.insertMany(emotionPieces);

    // --- 4. Update User and GameState ---
    const user = await User.findByIdAndUpdate(userId, { $inc: { completedCharacterCount: 1 } }, { new: true });
    if (!user) throw new Error('User not found during count update.');

    if (user.completedCharacterCount >= 9) {
      gameState.currentPhase = 'FINAL_PERSONA_GENERATION';
      await gameState.save();
      this.generateFinalPersona(userId); // Fire-and-forget
      return { status: 'final_persona_generation_started' };
    }

    gameState.currentPhase = 'DAY_WAITING';
    gameState.activeCharacterId = null;
    gameState.lastInteractionTime = new Date();
    await gameState.save();
    
    return {
      message: 'Story ended. A new card and emotion piece have been created.',
      card,
      emotionPieces,
    };
  }

  async startPsychologyPhase(userId: string) {
    const gameState = await GameState.findOne({ userId });
    if (!gameState) throw new Error('Game state not found.');
    if (gameState.currentPhase !== 'DAY_WAITING') throw new Error('Not in a waiting phase.');

    const now = new Date();
    const lastInteraction = gameState.lastInteractionTime;
    const hoursPassed = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);

    if (hoursPassed < 1) throw new Error('Skip is not available yet.');

    gameState.currentPhase = 'DAY_PSYCHOLOGY_TEST';
    await gameState.save();

    return { status: 'day_phase_psychology_test' };
  }

  async skipToMorning(userId: string) {
    const gameState = await GameState.findOne({ userId });
    if (!gameState) throw new Error('Game state not found.');
    if (gameState.currentPhase !== 'NIGHT_CONVERSATION') throw new Error('Not in a conversation phase.');

    // Logic to end current conversation and transition to DAY_WAITING
    // This might involve calling endCharacterStory or similar logic
    gameState.currentPhase = 'DAY_WAITING';
    gameState.activeCharacterId = null;
    gameState.lastInteractionTime = new Date();
    await gameState.save();

    return { status: 'skipped_to_morning' };
  }

  async skipToNight(userId: string) {
    const gameState = await GameState.findOne({ userId });
    if (!gameState) throw new Error('Game state not found.');
    if (gameState.currentPhase !== 'DAY_WAITING') throw new Error('Not in a waiting phase.');

    const now = new Date();
    const lastInteraction = gameState.lastInteractionTime;
    const hoursPassed = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);

    if (hoursPassed < 1) throw new Error('Skip is not available yet.'); // Or allow skip regardless of time

    gameState.currentPhase = 'NIGHT_CONVERSATION'; // Or trigger character generation
    gameState.lastInteractionTime = new Date();
    await gameState.save();

    return { status: 'skipped_to_night' };
  }

  async generateFinalPersona(userId: string) {
    try {
      console.log(`Starting final persona generation for user: ${userId}`);

      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const allConversationLogs = (await ConversationLog.find({ userId }).sort({ timestamp: 1 }))
        .map(log => `${log.speaker === 'user' ? '플레이어' : '캐릭터'}: ${log.message}`).join('\n');

      const finalPlayerAnalysis = user.playerAnalysis;

      const personaData = await geminiService.generateFinalPersona(finalPlayerAnalysis, allConversationLogs);

      const finalPersona = new Character({
        userId,
        name: personaData.name,
        description: personaData.description,
        problem: personaData.problem,
        personality: personaData.personality,
        initialDialogue: personaData.initialDialogue,
        isFixed: false,
        isFinalPersona: true,
        // TODO: (AI-8) Image generation will go here. For now, use a placeholder.
        pixelatedImageUrl: '/placeholders/final_persona.png',
      });
      await finalPersona.save();

      await GameState.findOneAndUpdate({ userId }, {
        currentPhase: 'NIGHT_CONVERSATION',
        activeCharacterId: finalPersona._id,
        $inc: { currentDay: 1 },
        lastInteractionTime: new Date(),
      });
      console.log(`Final persona created for user: ${userId}`);
    } catch (error) {
      console.error(`Failed to generate final persona for user ${userId}:`, error);
    }
  }

  async processPsychologyAndStartNight(userId: string, answers: any[]) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // --- 1. Deep Analysis (AI-6) ---
    const lastCharacterCard = await CharacterCard.findOne({ userId }).sort({ createdAt: -1 });
    let recent_conversation_log = '이전 대화 기록이 없습니다.';
    if (lastCharacterCard) {
      const logs = await ConversationLog.find({ characterId: lastCharacterCard.characterId }).sort({ timestamp: 1 });
      recent_conversation_log = logs.map(l => `${l.speaker === 'user' ? '플레이어' : '캐릭터'}: ${l.message}`).join('\n');
    }

    const analysisPrompt = promptService.getPrompt('player_deep_analysis_prompt', {
      current_analysis: user.playerAnalysis,
      recent_conversation_log,
      psychology_test_answers: answers,
      game_progress: `총 ${user.completedCharacterCount}명의 캐릭터와 만남`,
    });

    const analysisResult = await geminiService.generateJson(analysisPrompt);
    const { updatedAnalysis, characterElement } = analysisResult;

    // Update player analysis in DB
    user.playerAnalysis = updatedAnalysis;
    await user.save();

    // --- 2. Character Generation (AI-7) ---
    const generationPrompt = promptService.getPrompt('fairy_tale_character_generation_prompt', {
      character_element: characterElement,
      player_analysis_summary: updatedAnalysis.summary, // Assuming the analysis prompt returns a summary
    });

    const newCharacterData = await geminiService.generateJson(generationPrompt);

    // --- 3. Image Generation (AI-8) & Saving ---
    const imagePrompt = `A close-up portrait of ${newCharacterData.description}, simple fairy tale illustration style, plain white background, facing forward.`;
    let originalImageUrl: string | undefined;
    try {
      originalImageUrl = await geminiService.generateImage(imagePrompt);
      console.log(`Generated image URL: ${originalImageUrl}`);
    } catch (imageError) {
      console.error('Failed to generate image, using placeholder:', imageError);
      originalImageUrl = '/placeholders/default_character_image.png'; // Fallback
    }

    // TODO: Implement actual pixelation algorithm here. For now, use original or a placeholder.
    const pixelatedImageUrl = originalImageUrl; // Placeholder for pixelated image

    const newCharacter = new Character({
      userId,
      name: newCharacterData.name,
      description: newCharacterData.description,
      problem: newCharacterData.problem,
      personality: newCharacterData.personality,
      initialDialogue: newCharacterData.initialDialogue,
      isFixed: false,
      originalImageUrl, // Save the original image URL
      pixelatedImageUrl,
    });
    await newCharacter.save();

    // --- 4. Update GameState ---
    const gameState = await GameState.findOneAndUpdate({ userId }, {
      currentPhase: 'NIGHT_CONVERSATION',
      activeCharacterId: newCharacter._id,
      $inc: { currentDay: 1 },
      lastInteractionTime: new Date(),
    }, { new: true });

    return {
      status: 'new_night_started',
      character: newCharacter,
      gameState,
    };
  }
}

export default GameService;