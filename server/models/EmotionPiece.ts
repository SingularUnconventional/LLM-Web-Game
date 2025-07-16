import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IEmotionPiece extends Document {
  name: string;
  description: string;
  symbol: string; // e.g., an emoji or a short descriptive word
  acquiredAt: Date;
  fromCharacterSession: Types.ObjectId; // Reference to the GameSession it was acquired from
  userId: Types.ObjectId; // Reference to the user who acquired it
}

const EmotionPieceSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  symbol: { type: String, required: true },
  acquiredAt: { type: Date, default: Date.now },
  fromCharacterSession: { type: Schema.Types.ObjectId, ref: 'GameSession', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export default mongoose.model<IEmotionPiece>('EmotionPiece', EmotionPieceSchema);
