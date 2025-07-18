import { Schema, model, Document } from 'mongoose';

// 상담 기록 데이터 인터페이스
export interface ICounselingLog extends Document {
  characterId: Schema.Types.ObjectId; // 어떤 캐릭터와의 상담인지
  turn: number; // 해당 상담의 몇 번째 턴인지
  userMessage: string; // 사용자의 메시지
  aiMessage: string; // AI의 응답 메시지
  emotionKeyword: string; // 해당 턴에서 추출된 감정 키워드
  createdAt: Date;
}

const CounselingLogSchema = new Schema<ICounselingLog>({
  characterId: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
  },
  turn: {
    type: Number,
    required: true,
  },
  userMessage: {
    type: String,
    required: true,
  },
  aiMessage: {
    type: String,
    required: true,
  },
  emotionKeyword: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// characterId와 turn을 복합 인덱스로 설정하여 중복 방지
CounselingLogSchema.index({ characterId: 1, turn: 1 }, { unique: true });

export const CounselingLog = model<ICounselingLog>(
  'CounselingLog',
  CounselingLogSchema
);