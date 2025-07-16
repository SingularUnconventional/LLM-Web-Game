import React from 'react';
import { useGame } from '@/contexts/GameContext';
import styles from './CharacterDisplay.module.css';

const CharacterDisplay: React.FC = () => {
  const { gameSession } = useGame();

  if (!gameSession) {
    return <div>캐릭터 정보를 불러오는 중...</div>;
  }

  const { characterPersona, characterImageContentId, characterEmotionProgress } = gameSession;

  // TODO: Implement image fetching from backend using characterImageContentId
  const imageUrl = `/api/images/${characterImageContentId}`; // Placeholder for now

  return (
    <div className={styles.characterDisplayContainer}>
      <img src={imageUrl} alt={characterPersona.name} className={styles.characterImage} />
      <h2>{characterPersona.name}</h2>
      <p>{characterPersona.appearance_description}</p>
      <p className={styles.currentEmotion}>현재 감정: {characterEmotionProgress.currentEmotionState}</p>
      {/* Add more character details as needed */}
    </div>
  );
};

export default CharacterDisplay;
