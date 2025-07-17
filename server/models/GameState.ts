import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IGameState extends Document {
  userId: Types.ObjectId;
  currentDay: number;
  timeOfDay: 'day' | 'night';
  currentPhase: 'NIGHT_CONVERSATION' | 'DAY_WAITING' | 'DAY_PSYCHOLOGY_TEST' | 'FINAL_PERSONA_GENERATION'; // Added
  activeCharacterId: Types.ObjectId | null;
  lastInteractionTime: Date;
}

const GameStateSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  currentDay: { type: Number, default: 1 },
  timeOfDay: { type: String, enum: ['day', 'night'], default: 'night' }, // Kept for now for compatibility
  currentPhase: { 
    type: String, 
    enum: ['NIGHT_CONVERSATION', 'DAY_WAITING', 'DAY_PSYCHOLOGY_TEST'], 
    default: 'NIGHT_CONVERSATION' 
  },
  activeCharacterId: { type: Schema.Types.ObjectId, ref: 'Character', default: null },
  lastInteractionTime: { type: Date, default: Date.now },
});

export default mongoose.model<IGameState>('GameState', GameStateSchema);