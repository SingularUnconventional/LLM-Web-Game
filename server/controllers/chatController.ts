import { Request, Response } from 'express';
import { Types } from 'mongoose';
import geminiService from '../services/geminiService';
import GameSession from '../models/GameSession';
import EmotionPiece from '../models/EmotionPiece'; // Import EmotionPiece model
import User from '../models/User'; // Import User model

class ChatController {
  async sendMessage(req: Request, res: Response) {
    try {
      const { gameSessionId, message } = req.body; // Expect gameSessionId from client
      // TODO: Add validation for gameSessionId and message

      const gameSession = await GameSession.findById(gameSessionId);
      if (!gameSession) {
        return res.status(404).json({ message: 'Game session not found.' });
      }

      // Add user message to history with current emotion snapshot
      gameSession.dialogueHistory.push({
        sender: 'user',
        message: message,
        timestamp: new Date(),
        characterEmotionState: { ...gameSession.characterEmotionProgress }, // Snapshot of current emotion
      });

      const { response: geminiResponse, newEmotion, updatedLongTermMemoryAdditions, conversationStatus } = await geminiService.generateChatResponse(
        gameSession.dialogueHistory,
        message,
        gameSession.characterPersona,
        gameSession.characterEmotionProgress, // Pass the full emotion progress object
        {
          character_config: {
            name: gameSession.characterPersona.name,
            appearance_description: gameSession.characterPersona.appearance_description,
            core_concern: gameSession.characterPersona.core_concern,
            personality_traits: gameSession.characterPersona.personality_traits,
            dialogue_style: gameSession.characterPersona.dialogue_style,
            primary_fear: gameSession.characterPersona.primary_fear,
            interpersonal_boundary: gameSession.characterPersona.interpersonal_boundary,
            behavior_when_alone: gameSession.characterPersona.behavior_when_alone,
          },
          character_world: {
            setting_summary: gameSession.characterPersona.setting_summary,
            absent_concepts: gameSession.characterPersona.absent_concepts,
          },
          initial_long_term_memory: gameSession.characterPersona.initial_long_term_memory,
        }, // Pass the full GeminiCharacterOutput object
        gameSession.dayNightCycle
      );

      // Update character's emotion
      gameSession.characterEmotionProgress.currentEmotionState = newEmotion;

      // Add character response to history with new emotion snapshot
      gameSession.dialogueHistory.push({
        sender: 'character',
        message: geminiResponse || '(No response from character)',
        timestamp: new Date(),
        characterEmotionState: { ...gameSession.characterEmotionProgress }, // Snapshot of new emotion
      });

      // Update long-term memory
      updatedLongTermMemoryAdditions.forEach(mem => {
        gameSession.longTermMemory.push({ type: 'gemini_addition', content: mem, timestamp: new Date() });
      });

      // Update conversation status
      gameSession.isResolved = conversationStatus.isNarrativeConflictResolved;
      
      // Handle emotion piece creation
      if (conversationStatus.triggerEmotionPieceCreation) {
        console.log('Emotion piece creation triggered!');
        const newEmotionPiece = new EmotionPiece({
          name: `조각: ${gameSession.characterPersona.core_concern}`, // Placeholder name
          description: `캐릭터 ${gameSession.characterName}의 핵심 고민에서 얻은 감정 조각입니다.`, // Placeholder description
          symbol: '✨', // Placeholder symbol
          fromCharacterSession: gameSession._id,
          userId: gameSession.userId as Types.ObjectId,
        });
        await newEmotionPiece.save();

        // Add to user's collected emotion pieces
        const user = await User.findById(gameSession.userId as Types.ObjectId);
        if (user) {
          user.collectedEmotionPieces.push(newEmotionPiece._id as Types.ObjectId);
          await user.save();
        }
      }

      // Handle day/night cycle transition
      if (conversationStatus.transitionToDayNightCycle) {
        console.log('Transition to day/night cycle triggered!');
        gameSession.dayNightCycle.isNight = !gameSession.dayNightCycle.isNight;
        if (!gameSession.dayNightCycle.isNight) {
          gameSession.dayNightCycle.currentDay += 1;
          gameSession.dayNightCycle.lastActionSummary = '캐릭터가 낮 동안 활동했습니다.'; // Placeholder
        }
      }

      await gameSession.save();

      res.status(200).json({ message: geminiResponse, newEmotion: newEmotion, conversationStatus: conversationStatus });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Failed to get chat response.' });
    }
  }
}

export default new ChatController();
