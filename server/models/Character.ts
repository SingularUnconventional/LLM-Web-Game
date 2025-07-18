import { Schema, model, Document } from 'mongoose';

// 캐릭터 상태 타입
type CharacterStatus = 'ongoing' | 'completed' | 'locked';

// 캐릭터 데이터 인터페이스
export interface ICharacter extends Document {
  userId: Schema.Types.ObjectId; // 해당 사용자 ID
  name: string; // 동화 캐릭터 이름 (e.g., "상처 입은 어린 왕자")
  description: string; // 캐릭터에 대한 설명 (AI가 생성)
  imageUrl: string; // 캐릭터 이미지 URL
  status: CharacterStatus; // 현재 캐릭터 진행 상태
  counselingCount: number; // 상담 횟수
  createdAt: Date;
}

const CharacterSchema = new Schema<ICharacter>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'locked'],
    default: 'locked',
  },
  counselingCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Character = model<ICharacter>('Character', CharacterSchema);

