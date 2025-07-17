import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { ICharacter, Message, GameStartResponse, ChatResponse, ConversationEndResult } from '../types/api';
import styles from './GamePlayPage.module.css';

const GamePlayPage: React.FC = () => {
  const [character, setCharacter] = useState<ICharacter | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [endResult, setEndResult] = useState<ConversationEndResult | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeGame = async (gameData: GameStartResponse) => {
      if (gameData.character) {
        setCharacter(gameData.character);
      }
      
      // If coming from initial counseling, there's no history, just the initial dialogue
      if (gameData.conversationHistory && gameData.conversationHistory.length > 0) {
        setMessages(gameData.conversationHistory);
      } else if (gameData.character?.initialDialogue) {
        setMessages([{ speaker: 'character', message: gameData.character.initialDialogue }]);
      }
      setIsLoading(false);
    };

    const fetchGameData = async () => {
      try {
        setIsLoading(true);
        const response: GameStartResponse = await api.game.startGame();
        if (response.status === 'game_loaded') {
          initializeGame(response);
        } else {
          // Handle other statuses, e.g., redirect
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Failed to fetch game data:", error);
        navigate('/dashboard');
      }
    };

    const gameDataFromState = location.state?.gameData as GameStartResponse;
    if (gameDataFromState) {
      initializeGame(gameDataFromState);
    } else {
      fetchGameData();
    }
  }, [location.state, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || isEnded) return;

    const userMessage: Message = { speaker: 'user', message: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Use the new game service endpoint
      const response: ChatResponse = await api.game.postChatMessage(input);
      const characterMessage: Message = { speaker: 'character', message: response.message };
      setMessages(prev => [...prev, characterMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = { speaker: 'character', message: '죄송합니다, 응답을 생성하는 데 실패했습니다.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndConversation = async () => {
    if (isLoading || isEnded) return;
    setIsLoading(true);
    try {
      const result = await api.game.endCharacterStory() as ConversationEndResult;
      if (result.status === 'final_persona_generation_started') {
        alert('당신의 모든 여정이 끝났습니다. 이제 마지막 이야기를 맞이할 시간입니다.');
        navigate('/dashboard');
      } else {
        setEndResult(result);
        setIsEnded(true);
      }
    } catch (error) {
      console.error('Error ending conversation:', error);
      alert('대화 종료에 실패했습니다.');
      setIsLoading(false);
    }
  };

  const renderEndScreen = () => {
    if (!endResult) return null; // Add null check
    return (
    <div className={styles.endScreen}>
      <h2>대화 결과</h2>
      <h3>{endResult?.card.outcome}</h3>
      <p>{endResult?.card.summary}</p>
      {endResult?.card && <div><strong>새로운 페르소나 카드를 얻었습니다!</strong></div>}
      {endResult?.emotionPieces?.length > 0 && (
        <div>
          <strong>새로운 감정 조각:</strong>
          <ul>
            {endResult.emotionPieces.map(p => <li key={p._id}>{p.keyword}</li>)}
          </ul>
        </div>
      )}
      <button onClick={() => navigate('/dashboard')}>대시보드로 돌아가기</button>
    </div>
    );
  };

  if (!character) {
    return <div className={styles.loading}>게임 데이터를 불러오는 중...</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.characterProfile}>
        <img src={character.pixelatedImageUrl || '/placeholder.png'} alt={character.name} />
        <h2>{character.name}</h2>
        <p>{character.description}</p>
        <p><strong>고민:</strong> {character.problem}</p>
      </div>
      <div className={styles.chatContainer}>
        {isEnded ? renderEndScreen() : (
          <>
            <div className={styles.messageList}>
              {messages.map((msg, index) => (
                <div key={index} className={`${styles.messageBubble} ${styles[msg.speaker]}`}>
                  <p>{msg.message}</p>
                </div>
              ))}
              {isLoading && <div className={`${styles.messageBubble} ${styles.character} ${styles.typingIndicator}`}><span></span><span></span><span></span></div>}
              <div ref={chatEndRef} />
            </div>
            <div className={styles.messageInput}>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter' && !isLoading) handleSendMessage(); }} disabled={isLoading} />
              <button onClick={handleSendMessage} disabled={isLoading}>전송</button>
            </div>
            <button onClick={handleEndConversation} disabled={isLoading} className={styles.endButton}>이야기 끝내기</button>
          </>
        )}
      </div>
    </div>
  );
};

export default GamePlayPage;