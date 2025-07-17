import React from 'react';
import styles from './CharacterProfileCard.module.css'; // Reusing the same styles for now

interface CompletedCharacterCardProps {
  characterName: string;
  coreConcern: string;
  completedAt: string;
}

const CompletedCharacterCard: React.FC<CompletedCharacterCardProps> = ({ characterName, coreConcern, completedAt }) => {
  return (
    <div className={styles.profileCard}>
      <div className={styles.header}>
        <h3 className={styles.name}>{characterName}</h3>
      </div>

      <div className={styles.infoSection}>
        <h4>핵심 고민</h4>
        <p>{coreConcern}</p>
      </div>

      <div className={styles.infoSection}>
        <h4>클리어 날짜</h4>
        <p>{new Date(completedAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default CompletedCharacterCard;
