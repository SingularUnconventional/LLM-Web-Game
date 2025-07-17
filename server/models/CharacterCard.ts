import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICharacterCard extends Document {
  userId: Types.ObjectId;
  characterId: Types.ObjectId;
  summary: string;
  outcome: string;
  pixelatedImageUrl: string;
}

const CharacterCardSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  characterId: { type: Schema.Types.ObjectId, ref: 'Character', required: true, unique: true },
  summary: { type: String, required: true },
  outcome: { type: String, required: true },
  pixelatedImageUrl: { type: String, required: true },
});

export default mongoose.model<ICharacterCard>('CharacterCard', CharacterCardSchema);
