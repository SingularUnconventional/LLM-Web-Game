import React from 'react';
import styles from './EndingPage.module.css';

const EndingPage: React.FC = () => {
  return (
    <div className={styles.endingPageContainer}>
      <h1>페르소나 완성</h1>
      <p>모든 조각을 모아 당신의 상징적 자아가 완성되었습니다.</p>
      {/* TODO: Implement PersonaDisplay and epilogue based on collected emotion pieces */}
      <button onClick={() => window.location.href = '/'}>다시 시작하기</button>
    </div>
  );
};

export default EndingPage;