import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPsychologyAnswer extends Document {
  userId: Types.ObjectId;
  question: string;
  answer: string;
  createdAt: Date;
}

const PsychologyAnswerSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPsychologyAnswer>('PsychologyAnswer', PsychologyAnswerSchema);