import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import { GameSessionData, CharacterPersona, DialogueEntry } from '../types/api';

// --- Reducer Actions ---
type Action =
  | { type: 'SET_SESSION'; payload: GameSessionData | null }
  | { type: 'ADD_DIALOGUE_ENTRY'; payload: DialogueEntry }
  | { type: 'UPDATE_EMOTION'; payload: string }
  | { type: 'UPDATE_CONVERSATION_STATUS'; payload: { isResolved: boolean } }
  | { type: 'SET_TIME_OF_DAY'; payload: 'day' | 'night' }; // Added for Day/Night theme

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
    case 'SET_TIME_OF_DAY':
      if (!state) return null;
      return {
        ...state,
        timeOfDay: action.payload,
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

  // Initial state for timeOfDay. This should ideally come from the backend GameState.
  // For now, we'll set a default and expect it to be updated by backend data.
  React.useEffect(() => {
    if (!gameSession) {
      dispatch({ type: 'SET_SESSION', payload: { 
        _id: '', userId: '', characterName: '', characterCreationTime: new Date(), 
        characterImageContentId: '', characterPersona: {} as CharacterPersona, 
        dialogueHistory: [], characterEmotionProgress: { currentEmotionState: '' }, 
        isResolved: false, timeOfDay: 'day', currentPhase: '' // Default to day
      } as GameSessionData });
    }
  }, [gameSession]);

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
