import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import styles from './GamePlayPage.module.css';

const GamePlayPage: React.FC = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();
  const { 
    activeCharacter, 
    counselingHistory, 
    isLoading, 
    error, 
    selectCharacter, 
    sendMessage 
  } = useGame();
  
  const [inputMessage, setInputMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (characterId) {
      selectCharacter(characterId);
    } else {
      // characterId가 없으면 홈페이지로 리디렉션
      navigate('/');
    }
  }, [characterId, selectCharacter, navigate]);

  useEffect(() => {
    // 채팅창 스크롤을 항상 아래로 유지
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [counselingHistory]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      sendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  if (!activeCharacter && isLoading) {
    return <div>Loading character...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }
  
  if (!activeCharacter) {
    return (
      <div>
        <p>캐릭터를 찾을 수 없습니다. 홈으로 돌아가 다시 시도해주세요.</p>
        <button onClick={() => navigate('/')}>홈으로</button>
      </div>
    );
  }

  return (
    <div className={styles.gamePlayContainer}>
      <div className={styles.characterProfile}>
        <img src={activeCharacter.imageUrl} alt={activeCharacter.name} className={styles.characterImage} />
        <h2 className={styles.characterName}>{activeCharacter.name}</h2>
        <p className={styles.characterDescription}>{activeCharacter.description}</p>
      </div>
      <div className={styles.chatInterface}>
        <div className={styles.chatMessages} ref={chatContainerRef}>
          {counselingHistory.map((log) => (
            <div key={log._id}>
              <div className={`${styles.message} ${styles.userMessage}`}>
                <p>{log.userMessage}</p>
              </div>
              <div className={`${styles.message} ${styles.aiMessage}`}>
                <p>{log.aiMessage}</p>
              </div>
            </div>
          ))}
          {isLoading && counselingHistory.length > 0 && counselingHistory[counselingHistory.length - 1].aiMessage === '...' && (
             <div className={`${styles.message} ${styles.aiMessage}`}>
                <div className={styles.typingIndicator}>
                  <span></span><span></span><span></span>
                </div>
              </div>
          )}
        </div>
        <form onSubmit={handleSendMessage} className={styles.chatInputForm}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className={styles.chatInput}
            disabled={isLoading}
          />
          <button type="submit" className={styles.sendButton} disabled={isLoading}>
            전송
          </button>
        </form>
      </div>
    </div>
  );
};

export default GamePlayPage;
