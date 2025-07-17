import { ICharacter, Message, GameStartResponse, InitialCounselingSubmitResponse, ConversationEndResult, ICharacterCard, PsychologyTestResponse, ApiType } from '../types/api';

interface RequestOptions extends RequestInit {
  // You can add custom options here if needed
}

// Function to get the token from localStorage
const getToken = (): string | null => {
  const userString = localStorage.getItem('user');
  if (userString) {
    const user = JSON.parse(userString);
    return user.token || null;
  }
  return null;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const API_BASE_URL = '/api';
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    throw new Error(errorData?.message || `Request failed with status ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }
  return Promise.resolve(null as T);
}

const get = <T>(endpoint: string): Promise<T> => request<T>(endpoint);
const post = <T>(endpoint: string, body: any): Promise<T> =>
  request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) });
const put = <T>(endpoint: string, body: any): Promise<T> =>
  request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) });
const del = <T>(endpoint: string): Promise<T> =>
  request<T>(endpoint, { method: 'DELETE' });

export const api: ApiType = {
  auth: {
    register: (username: string, email: string, password: string) => post('/auth/register', { username, email, password }),
    login: (email: string, password: string) => post('/auth/login', { email, password }),
  },
  game: {
    startGame: () => get<GameStartResponse>('/game/start'),
    submitInitialCounseling: (log: any) => post('/game/initial-counseling', { log }),
    postChatMessage: (message: string) => post('/game/chat', { message }),
    endCharacterStory: () => post('/game/end-story', {}),
    skipToMorning: () => post('/game/skip-morning', {}),
    skipToNight: () => post('/game/skip-night', {}),
    startPsychologyPhase: () => post('/game/start-psychology', {}),
  },
  counseling: {
    getHistory: () => get<Message[]>('/counseling/history'),
    postMessage: (message: string) => post<{ message: string }>('/counseling/message', { message }),
    postInitialChatMessage: (messages: any) => post('/counseling/initial-chat', { messages }),
    submitInitialCounseling: (messages: any) => post<InitialCounselingSubmitResponse>('/counseling/initial', { messages }),
  },
  character: {
    generateInitialCharacters: () => post('/character/initial', {}),
    selectCharacter: (characterId: string) => post('/character/select', { characterId }),
    postMessage: (message: string) => post('/character/message', { message }),
    endConversation: () => post<ConversationEndResult>('/character/end-conversation', {}),
    getActiveCharacter: () => get('/character/current'),
    getHistory: () => get('/character/history'),
    getCards: () => get<ICharacterCard[]>('/character/cards'),
    getUnselected: () => get<ICharacter[]>('/character/unselected'),
    getCharacterById: (id: string) => get<ICharacter>(`/character/${id}`),
    getEmotionPieces: () => get('/character/emotion-pieces'),
    finalizePersona: () => post('/character/finalize-persona', {}),
  },
  psychology: {
    submitAnswers: (answers: any[]) => post<PsychologyTestResponse>('/psychology/answers', { answers }),
  },
  get,
  post,
  put,
  delete: del,
};