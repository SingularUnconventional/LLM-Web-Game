export interface User {
  id: string;
  username: string;
  email: string;
  token: string;
}

export interface ICharacter {
  _id: string;
  userId: string;
  name: string;
  description: string;
  problem: string;
  personality: string;
  initialDialogue: string;
  originalImageUrl: string;
  pixelatedImageUrl: string;
  isFixed: boolean;
  isFinalPersona: boolean;
  createdAt: string;
}

export interface EmotionPiece {
  _id: string;
  userId: string;
  characterCardId: string;
  keyword: string;
  acquiredAt: string;
}

export interface ICharacterCard {
  _id: string;
  userId: string;
  characterId: string;
  summary: string;
  outcome: string;
  pixelatedImageUrl: string;
}

export interface Message {
  speaker: 'user' | 'ai' | 'character';
  message: string;
}

export interface GameStartResponse {
  status: 'initial_counseling_needed' | 'game_loaded' | 'day_phase_waiting' | 'day_phase_psychology_test' | 'night_phase_character_generation_pending';
  gameState?: any; // Define more specifically if possible
  character?: ICharacter;
  conversationHistory?: Message[];
  isSkipEnabled?: boolean;
  lastInteractionTime?: string; // Assuming ISO string
}

export interface ChatResponse {
  message: string;
}

export interface ConversationEndResult {
  status: string;
  message: string;
  card: ICharacterCard;
  emotionPieces: EmotionPiece[];
}

export interface CounselingChatResponse {
  message: string;
}

export interface InitialCounselingSubmitResponse {
  status: string;
  character: ICharacter;
  gameState: any; // Define a proper GameState type if available
}

export interface CharacterPersona {
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

export interface DialogueEntry {
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
  timeOfDay: 'day' | 'night';
  currentPhase: string;
}

export interface PsychologyTestResponse {
  status: 'new_night_started';
  gameState: GameSessionData;
  character: ICharacter;
}

export interface ApiType {
  auth: {
    register: (username: string, email: string, password: string) => Promise<User>;
    login: (email: string, password: string) => Promise<User>;
  };
  game: {
    startGame: () => Promise<GameStartResponse>;
    submitInitialCounseling: (log: any) => Promise<InitialCounselingSubmitResponse>;
    postChatMessage: (message: string) => Promise<ChatResponse>;
    endCharacterStory: () => Promise<ConversationEndResult>;
    skipToMorning: () => Promise<any>;
    skipToNight: () => Promise<any>;
    startPsychologyPhase: () => Promise<any>;
  };
  counseling: {
    getHistory: () => Promise<Message[]>;
    postMessage: (message: string) => Promise<{ message: string }>;
    postInitialChatMessage: (messages: any) => Promise<CounselingChatResponse>;
    submitInitialCounseling: (messages: any) => Promise<InitialCounselingSubmitResponse>;
  };
  character: {
    generateInitialCharacters: () => Promise<ICharacter[]>;
    selectCharacter: (characterId: string) => Promise<any>;
    postMessage: (message: string) => Promise<any>;
    endConversation: () => Promise<ConversationEndResult>;
    getActiveCharacter: () => Promise<any>;
    getHistory: () => Promise<any>;
    getCards: () => Promise<ICharacterCard[]>;
    getUnselected: () => Promise<ICharacter[]>;
    getCharacterById: (id: string) => Promise<ICharacter>;
    getEmotionPieces: () => Promise<EmotionPiece[]>;
    finalizePersona: () => Promise<any>;
  };
  psychology: {
    submitAnswers: (answers: any[]) => Promise<PsychologyTestResponse>;
  };
  get: <T>(endpoint: string) => Promise<T>;
  post: <T>(endpoint: string, body: any) => Promise<T>;
  put: <T>(endpoint: string, body: any) => Promise<T>;
  delete: <T>(endpoint: string) => Promise<T>;
}