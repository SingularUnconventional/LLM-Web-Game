import { Schema, model, Document } from 'mongoose';

// 플레이어 분석 데이터 인터페이스
export interface IPlayerAnalysis extends Document {
  userId: Schema.Types.ObjectId; // 해당 사용자 ID
  initialAnalysis: string; // 초기 상담 분석 결과
  ongoingAnalysis: string; // 지속적인 상담 분석 결과 (누적)
  emotionShards: Map<string, number>; // 감정 조각 (획득한 키워드, 횟수)
  finalPersona: string; // 최종 페르소나
}

const PlayerAnalysisSchema = new Schema<IPlayerAnalysis>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    initialAnalysis: {
      type: String,
      default: '',
    },
    ongoingAnalysis: {
      type: String,
      default: '',
    },
    emotionShards: {
      type: Map,
      of: Number,
      default: {},
    },
    finalPersona: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 기록
  }
);

export const PlayerAnalysis = model<IPlayerAnalysis>(
  'PlayerAnalysis',
  PlayerAnalysisSchema
);