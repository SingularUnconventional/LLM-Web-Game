import React from 'react';
import styles from './EmotionLog.module.css';
import { ICharacterCard } from '../../server/models/CharacterCard';

interface EmotionLogProps {
  characterCards: ICharacterCard[];
}

const EmotionLog: React.FC<EmotionLogProps> = ({ characterCards }) => {
  return (
    <div className={styles.logContainer}>
      <ul className={styles.logList}>
        {characterCards.map((card, index) => (
          <li key={card._id || index} className={styles.logItem}>
            <span className={styles.emotionShard}>{card.emotionShard}</span>
          </li>
        ))}
        {/* 10개 목표에 대한 진행도를 시각적으로 보여주기 위해 빈 슬롯 추가 */}
        {Array.from({ length: 10 - characterCards.length }).map((_, index) => (
          <li key={`empty-${index}`} className={styles.emptySlot}></li>
        ))}
      </ul>
    </div>
  );
};

export default EmotionLog;
