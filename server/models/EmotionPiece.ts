import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IEmotionPiece extends Document {
  characterCardId: Types.ObjectId;
  keyword: string;
  createdAt: Date;
}

const EmotionPieceSchema: Schema = new Schema({
  characterCardId: { type: Schema.Types.ObjectId, ref: 'CharacterCard', required: true },
  keyword: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IEmotionPiece>('EmotionPiece', EmotionPieceSchema);