import React from 'react';
import styles from './PersonaCollectionPage.module.css';

const PersonaCollectionPage: React.FC = () => {
  return (
    <div className={styles.personaCollectionPageContainer}>
      <h1>나의 페르소나 조각들</h1>
      <p>수집한 감정 조각들이 여기에 전시됩니다.</p>
      {/* TODO: Fetch and display collected emotion pieces from User model */}
    </div>
  );
};

export default PersonaCollectionPage;
