import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { ICharacterCard } from '../types/api';
import CompletedCharacterCard from '../components/CompletedCharacterCard';
import styles from './EndingPage.module.css';

const EndingPage: React.FC = () => {
  const [cards, setCards] = useState<ICharacterCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const fetchedCards = await api.character.getCards();
        setCards(fetchedCards);
      } catch (error) {
        console.error('Failed to fetch character cards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, []);

  return (
    <div className={styles.endingPageContainer}>
      <h1 className={styles.title}>당신의 여정</h1>
      <p className={styles.subtitle}>당신과 함께한 모든 이야기들입니다.</p>

      {isLoading ? (
        <p>여정을 불러오는 중...</p>
      ) : (
        <div className={styles.cardGrid}>
          {cards.map((card) => (
            <CompletedCharacterCard key={card._id} card={card} />
          ))}
        </div>
      )}

      <button
        className={styles.restartButton}
        onClick={() => (window.location.href = '/')}
      >
        새로운 여정 시작하기
      </button>
    </div>
  );
};

export default EndingPage;
