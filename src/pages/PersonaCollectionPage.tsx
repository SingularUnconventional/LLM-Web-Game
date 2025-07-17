import React, { useEffect, useState } from 'react';
import styles from './PersonaCollectionPage.module.css';
import { api } from '../utils/api';
import CompletedCharacterCard from '../components/CompletedCharacterCard';
import { CompletedSession } from '../types/api';

const PersonaCollectionPage: React.FC = () => {
  const [completedSessions, setCompletedSessions] = useState<CompletedSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompletedSessions = async () => {
      try {
        const response = await api.get<CompletedSession[]>('/sessions/completed');
        setCompletedSessions(response);
      } catch (err) {
        console.error('Failed to fetch completed sessions:', err);
        setError('Failed to load completed sessions.');
      }
      finally {
        setLoading(false);
      }
    };

    fetchCompletedSessions();
  }, []);

  if (loading) {
    return <div className={styles.personaCollectionPageContainer}>로딩 중...</div>;
  }

  if (error) {
    return <div className={styles.personaCollectionPageContainer}><p style={{ color: 'red' }}>{error}</p></div>;
  }

  return (
    <div className={styles.personaCollectionPageContainer}>
      <h1>나의 꿈 목록</h1>
      {completedSessions.length === 0 ? (
        <p>아직 완료된 꿈이 없습니다. 새로운 꿈을 시작해보세요!</p>
      ) : (
        <div className={styles.sessionGrid}>
          {completedSessions.map((session) => (
            <CompletedCharacterCard
              key={session._id}
              characterName={session.characterName}
              coreConcern={session.coreConcern}
              completedAt={session.completedAt}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonaCollectionPage;
