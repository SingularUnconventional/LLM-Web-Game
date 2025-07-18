import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { IPlayerAnalysis } from './PlayerAnalysis';

// 사용자 정보 인터페이스
export interface IUser extends Document {
  email: string;
  password: string;
  nickname: string;
  playerAnalysis: IPlayerAnalysis['_id']; // 플레이어 분석 데이터 참조
  completedCharacterIds: Schema.Types.ObjectId[]; // 완료한 캐릭터 ID 목록
  createdAt: Date;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    required: true,
    unique: true,
  },
  playerAnalysis: {
    type: Schema.Types.ObjectId,
    ref: 'PlayerAnalysis',
  },
  completedCharacterIds: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Character',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 비밀번호 암호화 (저장 전)
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// 비밀번호 비교 메서드
UserSchema.methods.comparePassword = function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser>('User', UserSchema);

