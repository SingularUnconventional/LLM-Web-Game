import React, { useState } from 'react';
import PsychologyTest from '@/components/PsychologyTest/PsychologyTest';
import styles from './HomePage.module.css';

const HomePage = () => {
  const [showTest, setShowTest] = useState(false);

  const handleStartClick = () => {
    setShowTest(true);
  };

  return (
    <div className={styles.homePageContainer}>
      {!showTest ? (
        <div className={styles.startScreen}>
          <h1>지금, 당신의 마음과 연결할 준비가 되셨나요?</h1>
          <button onClick={handleStartClick}>시작하기</button>
        </div>
      ) : (
        <PsychologyTest />
      )}
    </div>
  );
};

export default HomePage;
