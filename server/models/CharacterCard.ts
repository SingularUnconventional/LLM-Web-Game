import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICharacterCard extends Document {
  userId: Types.ObjectId;
  characterId: Types.ObjectId;
  summary: string;
  outcome: string;
  pixelatedImageUrl?: string;
  createdAt: Date;
}

const CharacterCardSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  characterId: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
  summary: { type: String, required: true },
  outcome: { type: String, required: true },
  pixelatedImageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ICharacterCard>('CharacterCard', CharacterCardSchema);