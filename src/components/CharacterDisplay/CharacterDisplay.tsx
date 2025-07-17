import React from 'react';
import { useGame } from '../../contexts/GameContext';
import styles from './CharacterDisplay.module.css';

const CharacterDisplay: React.FC = () => {
  const { gameSession } = useGame();
  
  // In a real implementation, you'd fetch the image URL from your backend/CDN
  // using the `characterImageContentId`. For now, we use a placeholder.
  const imageUrl = `/api/images/${gameSession?.characterImageContentId}`;

  return (
    <div 
      className={styles.displayContainer}
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      <div className={styles.overlay}></div>
    </div>
  );
};

export default CharacterDisplay;
