import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICounselingLog extends Document {
  userId: Types.ObjectId;
  speaker: 'user' | 'ai';
  message: string;
  timestamp: Date;
  isInitial: boolean; // To distinguish between initial and ongoing counseling
}

const CounselingLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  speaker: { type: String, enum: ['user', 'ai'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isInitial: { type: Boolean, default: false },
});

export default mongoose.model<ICounselingLog>('CounselingLog', CounselingLogSchema);
