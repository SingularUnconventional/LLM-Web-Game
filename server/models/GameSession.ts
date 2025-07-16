import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IGameSession extends Document {
  userId: Types.ObjectId;
  characterName: string; // Added
  characterCreationTime: Date; // Added
  characterImageContentId: string;
  characterPersona: {
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
  };
  dialogueHistory: Array<{
    sender: 'user' | 'character'; // Changed from speaker
    message: string;
    timestamp: Date;
    characterEmotionState?: { // Added
      currentEmotionState?: string;
      anxiety_level?: number;
      trust_level?: number;
    };
  }>;
  characterEmotionProgress: { // Replaced currentEmotion, targetEmotion, emotionProgress
    currentEmotionState: string; // e.g., "슬픔"
    anxiety_level?: number;
    trust_level?: number;
    // Add other relevant emotion metrics
  };
  longTermMemory: Array<{
    type: string; // e.g., "player_statement", "character_conclusion"
    content: string;
    timestamp: Date;
  }>;
  dayNightCycle: {
    currentDay: number;
    isNight: boolean;
    lastActionSummary?: string;
  };
  isResolved: boolean; // Added
  sessionCompletionTime?: Date; // Added
}

const GameSessionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  characterName: { type: String, required: true }, // Added
  characterCreationTime: { type: Date, default: Date.now }, // Added
  characterImageContentId: { type: String, required: true },
  characterPersona: {
    name: { type: String, required: true }, // Re-added name to characterPersona schema
    appearance_description: { type: String, required: true },
    core_concern: { type: String, required: true },
    personality_traits: [{ type: String, required: true }],
    dialogue_style_guidelines: {
      sentence_length: { type: String },
      emoji_usage: { type: String },
      tone: { type: String },
    },
    dialogue_style: { type: String, required: true },
    primary_fear: { type: String, required: true },
    interpersonal_boundary: { type: String, required: true },
    behavior_when_alone: { type: String, required: true },
    setting_summary: { type: String, required: true },
    absent_concepts: [{ type: String, required: true }],
    initial_long_term_memory: [{ type: String, required: true }],
  },
  dialogueHistory: [
    {
      sender: { type: String, required: true }, // Changed from speaker
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      characterEmotionState: { // Added
        currentEmotionState: { type: String },
        anxiety_level: { type: Number },
        trust_level: { type: Number },
      },
    },
  ],
  characterEmotionProgress: { // Replaced
    currentEmotionState: { type: String, default: 'neutral' },
    anxiety_level: { type: Number, default: 0 },
    trust_level: { type: Number, default: 0 },
  },
  longTermMemory: [
    {
      type: { type: String },
      content: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  dayNightCycle: {
    currentDay: { type: Number, default: 1 },
    isNight: { type: Boolean, default: false },
    lastActionSummary: { type: String },
  },
  isResolved: { type: Boolean, default: false }, // Added
  sessionCompletionTime: { type: Date }, // Added
});

export default mongoose.model<IGameSession>('GameSession', GameSessionSchema);