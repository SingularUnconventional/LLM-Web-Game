import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

const HomePage: React.FC = () => {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>마음의 페르소나</h1>
        <p className={styles.subtitle}>
          AI 상담을 통해 당신의 무의식 속 캐릭터를 만나고, 잃어버린 감정의 조각을 찾아 떠나는 여정
        </p>
        <Link to="/auth" className={styles.ctaButton}>
          게임 시작하기
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
