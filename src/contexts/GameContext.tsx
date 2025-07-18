import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import * as api from '../utils/api';
import { ICharacter, ICounselingLog, IEnding, CharacterDetailsResponse, HandleTurnResponse } from '../types/api';
import { useAuth } from './AuthContext';

interface GameContextType {
  characters: ICharacter[];
  activeCharacter: ICharacter | null;
  counselingHistory: ICounselingLog[];
  isLoading: boolean;
  error: string | null;
  fetchCharacters: () => Promise<void>;
  selectCharacter: (characterId: string) => Promise<void>;
  startGame: (testResult: string) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [characters, setCharacters] = useState<ICharacter[]>([]);
  const [activeCharacter, setActiveCharacter] = useState<ICharacter | null>(null);
  const [counselingHistory, setCounselingHistory] = useState<ICounselingLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiCall = async <T,>(apiCall: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      return await apiCall();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An unknown error occurred';
      setError(errorMessage);
      console.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCharacters = useCallback(async () => {
    await handleApiCall(async () => {
      const { data } = await api.getAllCharacters();
      setCharacters(data);
    });
  }, []);

  const selectCharacter = useCallback(async (characterId: string) => {
    await handleApiCall(async () => {
      const { data } = await api.getCharacterDetails(characterId);
      setActiveCharacter(data.character);
      setCounselingHistory(data.counselingHistory);
    });
  }, []);

  const startGame = useCallback(async (testResult: string) => {
    await handleApiCall(async () => {
      const { data } = await api.startGame(testResult);
      // 게임 시작 후 캐릭�� 목록을 다시 불러와서 UI를 업데이트합니다.
      await fetchCharacters();
      // 새로 생성된 캐릭터를 활성 캐릭터로 설정할 수도 있습니다.
      if (data.character) {
        await selectCharacter(data.character._id);
      }
    });
  }, [fetchCharacters, selectCharacter]);

  const sendMessage = useCallback(async (message: string) => {
    if (!activeCharacter) {
      setError('No active character selected.');
      return;
    }

    // 낙관적 업데이트: 사용자의 메시지를 즉시 UI에 반영
    const userLog: ICounselingLog = {
      _id: `temp-${Date.now()}`,
      characterId: activeCharacter._id,
      turn: counselingHistory.length + 1,
      userMessage: message,
      aiMessage: '...', // AI가 응답을 생성 중임을 표시
      emotionKeyword: '',
      createdAt: new Date().toISOString(),
    };
    setCounselingHistory(prev => [...prev, userLog]);

    await handleApiCall(async () => {
      const { data } = await api.handleTurn(activeCharacter._id, message);
      
      // 서버 응답으로 실제 로그 업데이트
      setCounselingHistory(prev => {
          const newHistory = [...prev];
          const tempLogIndex = newHistory.findIndex(log => log._id === userLog._id);
          if (tempLogIndex !== -1) {
              // 임시 로그를 실제 AI 응답으로 교체
              newHistory[tempLogIndex].aiMessage = data.aiMessage || 'No response';
              newHistory[tempLogIndex].emotionKeyword = data.emotionKeyword || '';
          }
          return newHistory;
      });

      if (data.isEnding && data.ending) {
        // 엔딩 처리: UI에 엔딩을 표시하거나 다른 페이지로 이동
        alert(`Ending Reached: ${data.ending.title}`);
        setActiveCharacter(null); // 대화 종료
        await fetchCharacters(); // 캐릭터 목록 업데이트 (상태 변경)
      }
    });
  }, [activeCharacter, counselingHistory, fetchCharacters]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCharacters();
    } else {
      // 로그아웃 시 상태 초기화
      setCharacters([]);
      setActiveCharacter(null);
      setCounselingHistory([]);
    }
  }, [isAuthenticated, fetchCharacters]);

  return (
    <GameContext.Provider
      value={{
        characters,
        activeCharacter,
        counselingHistory,
        isLoading,
        error,
        fetchCharacters,
        selectCharacter,
        startGame,
        sendMessage,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
