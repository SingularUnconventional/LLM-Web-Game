import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IConversationLog extends Document {
  characterId: Types.ObjectId;
  speaker: 'user' | 'character';
  message: string;
  timestamp: Date;
  gameDay: number;
}

const ConversationLogSchema: Schema = new Schema({
  characterId: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
  speaker: { type: String, enum: ['user', 'character'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  gameDay: { type: Number, required: true },
});

export default mongoose.model<IConversationLog>('ConversationLog', ConversationLogSchema);