// 이 파일은 서버의 `models` 디렉토리와 API 응답을 기반으로 타입을 정의합니다.

// --- Auth ---
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  nickname: string;
}

export interface IUser {
  _id: string;
  email: string;
  nickname: string;
  playerAnalysis: string; // PlayerAnalysis ID
  completedCharacterIds: string[];
  createdAt: string;
  token?: string; // 로그인 응답에 포함
}

// --- Character ---
export type CharacterStatus = 'ongoing' | 'completed' | 'locked';

export interface ICharacter {
  _id: string;
  userId: string;
  name: string;
  description: string;
  imageUrl: string;
  status: CharacterStatus;
  counselingCount: number;
  createdAt: string;
}

// --- Counseling & Ending ---
export interface ICounselingLog {
  _id: string;
  characterId: string;
  turn: number;
  userMessage: string;
  aiMessage: string;
  emotionKeyword: string;
  createdAt: string;
}

export interface IEnding {
  _id: string;
  userId: string;
  characterId: string;
  finalPersona: string;
  endingType: string;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
}

// --- Player Analysis ---
export interface IPlayerAnalysis {
  _id: string;
  userId: string;
  initialAnalysis: string;
  ongoingAnalysis: string;
  emotionShards: Record<string, number>; // Map<string, number>는 JSON으로 직렬화될 때 객체로 변환됨
  finalPersona: string;
}


// --- API 응답 타입 ---

// GET /api/character/:characterId
export interface CharacterDetailsResponse {
  character: ICharacter;
  counselingHistory: ICounselingLog[];
}

// POST /api/game/:characterId/turn
export interface HandleTurnResponse {
  aiMessage?: string;
  emotionKeyword?: string;
  isEnding: boolean;
  ending?: IEnding; // isEnding이 true일 때만 존재
}