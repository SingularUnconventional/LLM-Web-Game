import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';

// --- Type Definitions ---
// It's good practice to have these in a separate types file (e.g., src/types/game.ts)
// if they are shared across different parts of the application.
interface CharacterPersona {
  name: string;
  appearance_description: string;
  core_concern: string;
  personality_traits: string[];
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
  characterEmotionState?: {
    currentEmotionState?: string;
    anxiety_level?: number;
    trust_level?: number;
  };
}

export interface GameSessionData {
  _id: string;
  userId: string;
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
  isResolved: boolean;
}

// --- Reducer Actions ---
type Action =
  | { type: 'SET_SESSION'; payload: GameSessionData | null }
  | { type: 'ADD_DIALOGUE_ENTRY'; payload: DialogueEntry }
  | { type: 'UPDATE_EMOTION'; payload: string }
  | { type: 'UPDATE_CONVERSATION_STATUS'; payload: { isResolved: boolean } };

// --- Reducer Function ---
const gameReducer = (state: GameSessionData | null, action: Action): GameSessionData | null => {
  switch (action.type) {
    case 'SET_SESSION':
      return action.payload;
    case 'ADD_DIALOGUE_ENTRY':
      if (!state) return null;
      return {
        ...state,
        dialogueHistory: [...state.dialogueHistory, action.payload],
      };
    case 'UPDATE_EMOTION':
      if (!state) return null;
      return {
        ...state,
        characterEmotionProgress: {
          ...state.characterEmotionProgress,
          currentEmotionState: action.payload,
        },
      };
    case 'UPDATE_CONVERSATION_STATUS':
      if (!state) return null;
      return {
        ...state,
        isResolved: action.payload.isResolved,
      };
    default:
      return state;
  }
};

// --- Context Definition ---
interface GameContextType {
  gameSession: GameSessionData | null;
  dispatch: Dispatch<Action>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// --- Provider Component ---
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameSession, dispatch] = useReducer(gameReducer, null);

  return (
    <GameContext.Provider value={{ gameSession, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// --- Custom Hook ---
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
