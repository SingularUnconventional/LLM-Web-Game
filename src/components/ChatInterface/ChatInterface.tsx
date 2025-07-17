import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../contexts/GameContext';
import { api } from '../../utils/api';
import styles from './ChatInterface.module.css';

interface ChatResponse {
  message: string;
  newEmotion: string;
  conversationStatus: {
    isNarrativeConflictResolved: boolean;
    triggerEmotionPieceCreation: boolean;
    transitionToDayNightCycle: boolean;
  };
}

const ChatInterface: React.FC = () => {
  const { gameSession, dispatch } = useGame();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [gameSession?.dialogueHistory, isLoading]);

  const handleSendMessage = async () => {
    if (!message.trim() || !gameSession?._id || isLoading) return;

    const userMessage = message.trim();
    
    dispatch({
      type: 'ADD_DIALOGUE_ENTRY',
      payload: {
        sender: 'user',
        message: userMessage,
        timestamp: new Date(),
        characterEmotionState: gameSession.characterEmotionProgress,
      }
    });
    setMessage('');
    setIsLoading(true);

    try {
      const response = await api.post<ChatResponse>('/chat/send', {
        gameSessionId: gameSession._id,
        message: userMessage,
      });

      dispatch({ type: 'UPDATE_EMOTION', payload: response.newEmotion });
      
      dispatch({
        type: 'ADD_DIALOGUE_ENTRY',
        payload: {
          sender: 'character',
          message: response.message,
          timestamp: new Date(),
          characterEmotionState: { currentEmotionState: response.newEmotion },
        }
      });

      dispatch({
        type: 'UPDATE_CONVERSATION_STATUS',
        payload: { isResolved: response.conversationStatus.isNarrativeConflictResolved }
      });

    } catch (error) {
      console.error('Error sending message:', error);
      dispatch({
        type: 'ADD_DIALOGUE_ENTRY',
        payload: {
          sender: 'character',
          message: '메시지를 보내는 데 실패했습니다. 잠시 후 다시 시도해주세요.',
          timestamp: new Date()
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatInterfaceContainer}>
      <div className={styles.messageList}>
        {gameSession?.dialogueHistory.map((entry, index) => (
          <div key={index} className={`${styles.messageBubble} ${entry.sender === 'user' ? styles.user : styles.character}`}>
            <p>{entry.message}</p>
            <span className={styles.timestamp}>{new Date(entry.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.messageBubble} ${styles.character} ${styles.typingIndicator}`}>
            <span></span><span></span><span></span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className={styles.messageInput}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !isLoading) {
              handleSendMessage();
            }
          }}
          placeholder="메시지를 입력하세요..."
          disabled={isLoading}
        />
        <button onClick={handleSendMessage} disabled={isLoading}>
          {isLoading ? '전송 중...' : '전송'}
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
