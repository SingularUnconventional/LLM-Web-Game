import { Schema, model, Document } from 'mongoose';

// 엔딩 데이터 인터페이스
export interface IEnding extends Document {
  userId: Schema.Types.ObjectId; // 해당 사용자 ID
  characterId: Schema.Types.ObjectId; // 함께 엔딩을 맞은 캐릭터 ID
  finalPersona: string; // 엔딩 시점의 최종 페르소나
  endingType: string; // 엔딩 종류 (e.g., 'Good', 'Bad', 'Hidden')
  title: string; // 엔딩 제목
  content: string; // 엔딩 내용
  imageUrl: string; // 엔딩 일러스트 이미지 URL
}

const EndingSchema = new Schema<IEnding>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
    },
    finalPersona: {
      type: String,
      required: true,
    },
    endingType: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 기록
  }
);

export const Ending = model<IEnding>('Ending', EndingSchema);