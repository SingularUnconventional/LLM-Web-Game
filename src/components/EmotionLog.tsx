import React from 'react';
import { useGame } from '@/contexts/GameContext';
import styles from './EmotionLog.module.css';

const EmotionLog: React.FC = () => {
  const { gameSession } = useGame();

  const emotionSnapshots = gameSession?.dialogueHistory
    .filter(entry => entry.sender === 'character' && entry.characterEmotionState?.currentEmotionState)
    .slice(-10); // Get last 10 snapshots

  return (
    <div className={styles.logContainer}>
      <h3>감정 변화 기록</h3>
      <ul className={styles.logList}>
        {emotionSnapshots?.map((entry, index) => (
          <li key={index} className={styles.logItem}>
            <span className={styles.logMessage}>{entry.message.substring(0, 20)}...</span>
            <span className={styles.logEmotion}>{entry.characterEmotionState?.currentEmotionState}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmotionLog;
