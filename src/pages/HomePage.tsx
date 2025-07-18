import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import styles from './HomePage.module.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { characters, isLoading: isGameLoading, fetchCharacters } = useGame();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login'); // 로그인 안했으면 로그인 페이지로
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  useEffect(() => {
    // 인증된 사용자의 캐릭터 목록을 가져옵니다.
    if (isAuthenticated) {
      fetchCharacters();
    }
  }, [isAuthenticated, fetchCharacters]);

  const ongoingCharacters = characters.filter(c => c.status === 'ongoing');
  const completedCharacters = characters.filter(c => c.status === 'completed');

  if (isAuthLoading || isGameLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>나의 이야기</h1>
      <p className={styles.subtitle}>마음 속 인물들과 대화하며 잃어버린 감정을 찾아보세요.</p>

      {characters.length === 0 && (
        <div className={styles.noCharacters}>
          <p>아직 당신의 이야기가 시작되지 않았습니다.</p>
          <Link to="/psychology-test" className={styles.ctaButton}>
            심리 테스트 시작하기
          </Link>
        </div>
      )}

      {ongoingCharacters.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>진행중인 이야기</h2>
          <div className={styles.characterGrid}>
            {ongoingCharacters.map(char => (
              <Link to={`/character/${char._id}`} key={char._id} className={styles.characterCard}>
                <img src={char.imageUrl} alt={char.name} className={styles.characterImage} />
                <h3 className={styles.characterName}>{char.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}

      {completedCharacters.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>완결된 이야기</h2>
          <div className={styles.characterGrid}>
            {completedCharacters.map(char => (
              <Link to={`/ending/${char._id}`} key={char._id} className={styles.characterCard}>
                <img src={char.imageUrl} alt={char.name} className={styles.characterImage} />
                <h3 className={styles.characterName}>{char.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* TODO: 새 캐릭터 생성 로직 (예: 특정 조건 만족 시) */}
    </div>
  );
};

export default HomePage;