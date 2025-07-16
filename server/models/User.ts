import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password?: string; // Optional for now, but will be required for auth
  email?: string;
  createdAt: Date;
  lastLoginAt?: Date;
  gameSessions: Types.ObjectId[];
  collectedEmotionPieces: Types.ObjectId[]; // Assuming EmotionPiece model will be created
  psychologyTestLogs: Array<{ // Array of Objects
    testId: string; // Or Types.ObjectId if you have a Test model
    responses: Array<{ questionId: string; answer: string }>; // Simplified for now
    completedAt: Date;
  }>;
  userPersonaAnalysis?: {
    coreTendencies: string[];
    insights: string;
  };
  settings?: {
    BGM_volume?: number;
    SFX_volume?: number;
    textSpeed?: number;
  };
  lastActiveSession?: Types.ObjectId;
  isPersonaComplete: boolean;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Will be true with auth
  email: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date },
  gameSessions: [{ type: Schema.Types.ObjectId, ref: 'GameSession' }],
  collectedEmotionPieces: [{ type: Schema.Types.ObjectId, ref: 'EmotionPiece' }],
  psychologyTestLogs: [
    {
      testId: { type: String, required: true },
      responses: [
        { questionId: { type: String, required: true }, answer: { type: String, required: true } },
      ],
      completedAt: { type: Date, default: Date.now },
    },
  ],
  userPersonaAnalysis: {
    coreTendencies: [{ type: String }],
    insights: { type: String },
  },
  settings: {
    BGM_volume: { type: Number, default: 0.5 },
    SFX_volume: { type: Number, default: 0.5 },
    textSpeed: { type: Number, default: 1 },
  },
  lastActiveSession: { type: Schema.Types.ObjectId, ref: 'GameSession' },
  isPersonaComplete: { type: Boolean, default: false },
});

export default mongoose.model<IUser>('User', UserSchema);
