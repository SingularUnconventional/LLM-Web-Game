import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICharacter extends Document {
  userId: Types.ObjectId;
  name: string;
  description: string;
  problem: string;
  personality: string;
  initialDialogue: string;
  originalImageUrl: string;
  pixelatedImageUrl: string;
  isFixed: boolean;
  isFinalPersona: boolean;
  createdAt: Date;
}

const CharacterSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  problem: { type: String, required: true },
  personality: { type: String, required: true },
  initialDialogue: { type: String, required: true },
  originalImageUrl: { type: String },
  pixelatedImageUrl: { type: String },
  isFixed: { type: Boolean, default: false },
  isFinalPersona: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ICharacter>('Character', CharacterSchema);
