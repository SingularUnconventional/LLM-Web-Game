import React, { useEffect, useState } from 'react';
import styles from './EmotionLogPage.module.css';
import { api } from '../utils/api';
import { EmotionPiece } from '../types/api';

const EmotionLogPage: React.FC = () => {
  const [emotionPieces, setEmotionPieces] = useState<EmotionPiece[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmotionPieces = async () => {
      try {
        const response = await api.get<EmotionPiece[]>('/emotions');
        setEmotionPieces(response);
      } catch (err) {
        console.error('Failed to fetch emotion pieces:', err);
        setError('Failed to load emotion pieces.');
      }
      finally {
        setLoading(false);
      }
    };

    fetchEmotionPieces();
  }, []);

  if (loading) {
    return <div className={styles.emotionLogPageContainer}>로딩 중...</div>;
  }

  if (error) {
    return <div className={styles.emotionLogPageContainer}><p style={{ color: 'red' }}>{error}</p></div>;
  }

  return (
    <div className={styles.emotionLogPageContainer}>
      <h1>나의 마음의 조각들</h1>
      {emotionPieces.length === 0 ? (
        <p>아직 수집한 마음의 조각이 없습니다.</p>
      ) : (
        <div className={styles.emotionGrid}>
          {emotionPieces.map((piece) => (
            <div key={piece._id} className={styles.emotionCard}>
              <h3>{piece.emotionType}</h3>
              <p>강도: {piece.intensity}</p>
              <p>맥락: {piece.context}</p>
              <p>수집일: {new Date(piece.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmotionLogPage;
