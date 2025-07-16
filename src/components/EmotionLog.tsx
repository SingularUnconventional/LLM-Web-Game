import React from 'react';
import styles from './EmotionLog.module.css';
import { useGame } from '@/contexts/GameContext';

const EmotionLog: React.FC = () => {
  const { gameSession } = useGame();

  if (!gameSession) {
    return <div className={styles.emotionLogContainer}>감정 로그를 불러오는 중...</div>;
  }

  return (
    <div className={styles.emotionLogContainer}>
      <h2>감정 로그</h2>
      <div className={styles.logEntries}>
        {gameSession.dialogueHistory.length === 0 ? (
          <p>아직 기록된 감정 변화가 없습니다.</p>
        ) : (
          gameSession.dialogueHistory.map((entry, index) => (
            <div key={index} className={styles.logEntry}>
              <span className={styles.logTimestamp}>{new Date(entry.timestamp).toLocaleString()}</span>
              <p className={styles.logMessage}>[{entry.sender === 'user' ? '나' : gameSession.characterPersona.name}]: {entry.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmotionLog;
