export interface EmotionPiece {
  _id: string;
  emotionType: string;
  intensity: number;
  context: string;
  createdAt: string;
}

export interface CompletedSession {
  _id: string;
  characterName: string;
  coreConcern: string;
  completedAt: string;
}

export interface CountResponse {
  count: number;
}

export interface User {
  id: string;
  username: string;
  token: string;
}
