import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  createdAt: Date;
  playerAnalysis: any; // JSONB/MIXED type
  completedCharacterCount: number;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  playerAnalysis: { type: Schema.Types.Mixed, default: null },
  completedCharacterCount: { type: Number, default: 0 },
});

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

UserSchema.methods.comparePassword = function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
