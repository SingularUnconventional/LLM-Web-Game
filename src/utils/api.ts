import axios from 'axios';
import { LoginData, RegisterData } from '../types/auth';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터를 사용하여 모든 요청에 JWT 토큰을 추가합니다.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Auth ---
export const register = (data: RegisterData) => api.post('/auth/register', data);
export const login = (data: LoginData) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// --- Game ---
/**
 * 심리 테스트 결과로 게임을 시작합니다.
 * @param testResult - 심리 테스트 결과 문자열
 */
export const startGame = (testResult: string) =>
  api.post('/game/start', { testResult });

/**
 * 캐릭터와 대화 턴을 진행합니다.
 * @param characterId - 현재 캐릭터의 ID
 * @param message - 사용자의 메시지
 */
export const handleTurn = (characterId: string, message: string) =>
  api.post(`/game/${characterId}/turn`, { message });

// --- Character ---
/**
 * 사용자의 캐릭터 목록을 가져옵니다.
 * @param status - 'ongoing' | 'completed' (선택 사항)
 */
export const getAllCharacters = (status?: 'ongoing' | 'completed') =>
  api.get('/character', { params: { status } });

/**
 * 특정 캐릭터의 상세 정보와 대화 기록을 가져옵니다.
 * @param characterId - 캐릭터의 ID
 */
export const getCharacterDetails = (characterId: string) =>
  api.get(`/character/${characterId}`);

/**
 * 새로운 캐릭터를 생성합니다.
 */
export const createNewCharacter = () => api.post('/character');

export default api;
