import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IEmotionPiece extends Document {
  userId: Types.ObjectId;
  characterCardId: Types.ObjectId;
  keyword: string; // e.g., "Longing", "Satisfaction", "Regret"
  acquiredAt: Date;
}

const EmotionPieceSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  characterCardId: { type: Schema.Types.ObjectId, ref: 'CharacterCard', required: true },
  keyword: { type: String, required: true },
  acquiredAt: { type: Date, default: Date.now },
});

export default mongoose.model<IEmotionPiece>('EmotionPiece', EmotionPieceSchema);
