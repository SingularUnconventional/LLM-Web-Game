import { Request, Response } from 'express';
import geminiService from '../services/geminiService';
import GameSession from '../models/GameSession';
import User from '../models/User';

class PsychologyController {
  async completeTest(req: Request, res: Response) {
    try {
      const testResult = req.body;
      // TODO: Add validation for testResult

      const characterData = await geminiService.generateCharacterPersonaAndImage(testResult);
      console.log('characterData received from geminiService:', JSON.stringify(characterData, null, 2));
      console.log('characterData.characterWorld:', characterData.characterWorld);
      console.log('characterData.characterWorld.setting_summary:', characterData.characterWorld?.setting_summary);
      console.log('characterData.characterWorld.absent_concepts:', characterData.characterWorld?.absent_concepts);
      console.log('characterData.initial_long_term_memory:', characterData.initial_long_term_memory);
      
      // For now, create a dummy user or find an existing one
      let user = await User.findOne({ username: 'testuser' });
      if (!user) {
        user = await User.create({ username: 'testuser' });
      }

      

      const newGameSession = new GameSession({
        userId: user._id,
        characterName: characterData.persona.name, // Added
        characterCreationTime: new Date(), // Added
        characterPersona: {
          ...characterData.persona,
          setting_summary: characterData.characterWorld?.setting_summary || 'A mysterious world setting',
          absent_concepts: characterData.characterWorld?.absent_concepts || [],
          initial_long_term_memory: characterData.initial_long_term_memory || [],
        },
        characterImageContentId: characterData.imageId,
        dialogueHistory: [],
        characterEmotionProgress: { currentEmotionState: 'neutral' }, // Initial emotion
        longTermMemory: [],
        dayNightCycle: { currentDay: 1, isNight: false },
        isResolved: false,
      });

      await newGameSession.save();

      res.status(201).json(newGameSession);
    } catch (error) {
      console.error('Error completing psychology test:', error);
      res.status(500).json({ message: 'Failed to generate character.' });
    }
  }
}

export default new PsychologyController();
