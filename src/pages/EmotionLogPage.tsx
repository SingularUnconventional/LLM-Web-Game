import React from 'react';
import EmotionLog from '@/components/EmotionLog';
import styles from './EmotionLogPage.module.css';

const EmotionLogPage: React.FC = () => {
  return (
    <div className={styles.emotionLogPageContainer}>
      <h1>나의 감정 기록</h1>
      <EmotionLog />
      {/* TODO: Add more detailed emotion analysis or filtering options */}
    </div>
  );
};

export default EmotionLogPage;
