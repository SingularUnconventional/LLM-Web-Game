import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { ICharacterCard } from '../types/api';
import CompletedCharacterCard from '../components/CompletedCharacterCard';
import styles from './PersonaCollectionPage.module.css';

const PersonaCollectionPage: React.FC = () => {
  const [cards, setCards] = useState<ICharacterCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const fetchedCards = await api.character.getCards();
        setCards(fetchedCards);
      } catch (error) {
        console.error("Failed to fetch character cards:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCards();
  }, []);

  if (isLoading) {
    return <div className={styles.loading}>페르소나 컬렉션을 불러오는 중...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>페르소나 컬렉션</h1>
      <p className={styles.subtitle}>당신과 함께 여정을 마친 페르소나들의 기록입니다.</p>
      {cards.length === 0 ? (
        <p className={styles.emptyMessage}>아직 완성된 페르소나가 없습니다.</p>
      ) : (
        <div className={styles.cardGrid}>
          {cards.map((card) => (
            <CompletedCharacterCard key={card._id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonaCollectionPage;