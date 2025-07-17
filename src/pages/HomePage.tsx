import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './Dashboard.module.css';
import { api } from '../utils/api';
import { CountResponse } from '../types/api';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [activeSessionsCount, setActiveSessionsCount] = useState<number | null>(null);
  const [emotionPiecesCount, setEmotionPiecesCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activeSessionsResponse = await api.get<CountResponse>('/sessions/activeCount');
        setActiveSessionsCount(activeSessionsResponse.count);

        const emotionPiecesResponse = await api.get<CountResponse>('/emotions/count');
        setEmotionPiecesCount(emotionPiecesResponse.count);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Optionally set error state or display a message
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <div className={styles.welcomeBox}>
        <h2>안녕하세요, {user?.username}님.</h2>
        <p>오늘 어떤 마음과 연결되고 싶으신가요?</p>
      </div>
      <div className={styles.actionGrid}>
        <Link to="/play" className={styles.actionCard}>
          <h3>대화 이어하기</h3>
          <p>진행 중인 페르소나와의 대화를 계속합니다.</p>
          <span className={styles.cardStatus}>
            {activeSessionsCount !== null ? `${activeSessionsCount}개의 대화 진행 중` : '로딩 중...'}
          </span>
        </Link>
        <Link to="/welcome" className={styles.actionCard}>
          <h3>새로운 연결</h3>
          <p>새로운 페르소나를 만나기 위한 심리 테스트를 시작합니다.</p>
        </Link>
        <Link to="/emotions" className={styles.actionCard}>
          <h3>감정 조각 보관함</h3>
          <p>지금까지 모은 마��의 조각들을 확인합니다.</p>
          <span className={styles.cardStatus}>
            {emotionPiecesCount !== null ? `${emotionPiecesCount}개의 조각 수집` : '로딩 중...'}
          </span>
        </Link>
      </div>
    </>
  );
};

export default HomePage;
