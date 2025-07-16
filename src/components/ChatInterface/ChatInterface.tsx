import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import { api } from '@/utils/api';
import styles from './ChatInterface.module.css';

const ChatInterface: React.FC = () => {
  const { gameSession, addDialogueEntry, updateCharacterEmotion } = useGame();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // New state for loading indicator
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [gameSession?.dialogueHistory, isLoading]); // Add isLoading to dependency array

  const handleSendMessage = async () => {
    if (!message.trim() || !gameSession?._id || isLoading) return; // Prevent sending multiple messages

    const userMessage = message.trim();
    // Add user message to history with current emotion snapshot
    addDialogueEntry({
      sender: 'user',
      message: userMessage,
      timestamp: new Date(),
      characterEmotionState: gameSession.characterEmotionProgress,
    });
    setMessage('');
    setIsLoading(true); // Set loading to true when sending message

    try {
      const response = await api.post('/chat/send', {
        gameSessionId: gameSession._id,
        message: userMessage,
      });
      // Update character's emotion in context
      updateCharacterEmotion(response.newEmotion);
      // Add character response to history with new emotion snapshot
      addDialogueEntry({
        sender: 'character',
        message: response.message,
        timestamp: new Date(),
        characterEmotionState: { currentEmotionState: response.newEmotion },
      });
    } catch (error) {
      console.error('Error sending message:', error);
      addDialogueEntry({ sender: 'character', message: '메시지를 보내는 데 실패했습니다.', timestamp: new Date() });
    } finally {
      setIsLoading(false); // Set loading to false after response or error
    }
  };

  return (
    <div className={styles.chatInterfaceContainer}>
      <div className={styles.messageList}>
        {gameSession?.dialogueHistory.map((entry, index) => (
          <div key={index} className={`${styles.messageBubble} ${entry.sender === 'user' ? styles.user : styles.character}`}>
            <p>{entry.message}</p>
            <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.messageBubble} ${styles.character} ${styles.typingIndicator}`}>
            <p>캐릭터가 입력 중...</p>
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
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
          placeholder="메시지를 입력하세요..."
          disabled={isLoading} // Disable input while loading
        />
        <button onClick={handleSendMessage} disabled={isLoading}>전송</button>
      </div>
    </div>
  );
};

export default ChatInterface;
