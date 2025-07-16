import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CharacterPersona {
  name: string;
  appearance_description: string;
  core_concern: string;
  personality_traits: string[];
  dialogue_style_guidelines?: {
    sentence_length?: string;
    emoji_usage?: string;
    tone?: string;
  };
  dialogue_style: string;
  primary_fear: string;
  interpersonal_boundary: string;
  behavior_when_alone: string;
  setting_summary: string;
  absent_concepts: string[];
  initial_long_term_memory: string[];
}

interface DialogueEntry {
  sender: 'user' | 'character';
  message: string;
  timestamp: Date;
  characterEmotionState?: { // Optional, as it's a snapshot
    currentEmotionState?: string;
    anxiety_level?: number;
    trust_level?: number;
  };
}

interface GameSessionData {
  _id: string;
  userId: string; // Changed from Types.ObjectId
  characterName: string;
  characterCreationTime: Date;
  characterImageContentId: string;
  characterPersona: CharacterPersona;
  dialogueHistory: DialogueEntry[];
  characterEmotionProgress: {
    currentEmotionState: string;
    anxiety_level?: number;
    trust_level?: number;
  };
  longTermMemory: Array<{
    type: string;
    content: string;
    timestamp: Date;
  }>;
  dayNightCycle: {
    currentDay: number;
    isNight: boolean;
    lastActionSummary?: string;
  };
  isResolved: boolean;
  sessionCompletionTime?: Date;
}

interface GameContextType {
  gameSession: GameSessionData | null;
  setGameSession: (session: GameSessionData | null) => void;
  addDialogueEntry: (entry: DialogueEntry) => void;
  updateCharacterEmotion: (newEmotion: string) => void; // New function to update emotion
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameSession, setGameSession] = useState<GameSessionData | null>(null);

  const addDialogueEntry = (entry: DialogueEntry) => {
    setGameSession(prevSession => {
      if (!prevSession) return null;
      return {
        ...prevSession,
        dialogueHistory: [...prevSession.dialogueHistory, entry]
      };
    });
  };

  const updateCharacterEmotion = (newEmotion: string) => {
    setGameSession(prevSession => {
      if (!prevSession) return null;
      return {
        ...prevSession,
        characterEmotionProgress: {
          ...prevSession.characterEmotionProgress,
          currentEmotionState: newEmotion,
        },
      };
    });
  };

  return (
    <GameContext.Provider value={{ gameSession, setGameSession, addDialogueEntry, updateCharacterEmotion }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
