import React from 'react';
import { useGame } from '@/contexts/GameContext';
import styles from './CharacterProfileCard.module.css';

const CharacterProfileCard: React.FC = () => {
  const { gameSession } = useGame();

  if (!gameSession) {
    return <div className={styles.profileCard}>캐릭터 정보를 불러오는 중...</div>;
  }

  const { characterPersona, characterEmotionProgress } = gameSession;

  return (
    <div className={styles.profileCard}>
      <div className={styles.header}>
        <h3 className={styles.name}>{characterPersona.name}</h3>
        <p className={styles.emotion}>{characterEmotionProgress.currentEmotionState}</p>
      </div>

      <div className={styles.infoSection}>
        <h4>핵심 고민</h4>
        <p>{characterPersona.core_concern}</p>
      </div>

      <div className={styles.infoSection}>
        <h4>성격 특성</h4>
        <ul className={styles.traits}>
          {characterPersona.personality_traits.map((trait, index) => (
            <li key={index} className={styles.trait}>{trait}</li>
          ))}
        </ul>
      </div>

      <div className={styles.infoSection}>
        <h4>주요 두려움</h4>
        <p>{characterPersona.primary_fear}</p>
      </div>
    </div>
  );
};

export default CharacterProfileCard;
