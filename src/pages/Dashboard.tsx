import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { GameStartResponse } from '../types/api';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [gameData, setGameData] = useState<GameStartResponse | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGameStatus = async () => {
      try {
        const response: GameStartResponse = await api.game.startGame();
        
        if (response.status === 'initial_counseling_needed') {
          navigate('/initial-counseling');
        } else if (response.status === 'day_phase_psychology_test') {
          navigate('/psychology-test');
        } else if (response.status === 'game_loaded') {
          navigate('/play', { state: { gameData: response } });
        } else {
          // For 'day_phase_waiting' and other pending states, stay on dashboard
          setGameData(response);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch game status:", error);
        setIsLoading(false);
      }
    };
    fetchGameStatus();
  }, [navigate]);

  const handleSkipToNight = async () => {
    setIsLoading(true);
    try {
      await api.game.startPsychologyPhase();
      navigate('/psychology-test');
    } catch (error) {
      console.error("Failed to start psychology phase:", error);
      alert("밤으로 이동하는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
      setIsLoading(false);
    }
  };

  const renderActionCard = () => {
    if (isLoading) {
      return <div className={styles.card}><h2>로딩 중...</h2></div>;
    }
    if (!gameData) {
       return <div className={styles.card}><h2>오류</h2><p>게임 상태를 불러올 수 없습니다.</p></div>;
    }

    if (gameData.status === 'day_phase_waiting') {
      return (
        <div className={`${styles.card} ${styles.actionCard}`}>
          <h2>낮이 되었습니다</h2>
          <p>지난밤의 이야기를 돌아보거나, 상담을 통해 마음을 정리할 시간입니다. 일정 시간이 지나면 밤으로 넘어갈 수 있습니다.</p>
          <button onClick={handleSkipToNight} disabled={!gameData.isSkipEnabled} className={styles.skipButton}>
            {gameData.isSkipEnabled ? '밤으로 넘어가기' : '아직은 쉴 시간...'}
          </button>
        </div>
      );
    }
    
    if (gameData.status === 'night_phase_character_generation_pending') {
      return (
        <div className={styles.card}>
          <h2>새로운 이야기 준비 중...</h2>
          <p>당신을 위한 다음 이야기가 준비되고 있습니다. 잠시 후 자동으로 시작됩니다.</p>
        </div>
      );
    }

    // Fallback card for 'no_active_character' or other states
    return (
       <Link to="/play" className={styles.card}>
        <h2>이야기 이어하기</h2>
        <p>진행 중인 이야기로 돌아갑니다.</p>
      </Link>
    );
  };

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.title}>대시보드</h1>
      <p className={styles.welcomeMessage}>마음의 페르소나에 오신 것을 환영합니다.</p>
      
      <div className={styles.cardContainer}>
        {renderActionCard()}
        <Link to="/persona-collection" className={styles.card}>
          <h2>내 페르소나 보기</h2>
          <p>지금까지 만나고 완성한 페르소나들을 확인합니다.</p>
        </Link>
        <Link to="/counseling" className={styles.card}>
          <h2>수시 상담하기</h2>
          <p>언제든 AI 상담사와 대화하며 마음을 점검할 수 있습니다.</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
