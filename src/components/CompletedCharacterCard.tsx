import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { ICharacter, ICharacterCard } from '../types/api';
import styles from './CompletedCharacterCard.module.css';

interface CompletedCharacterCardProps {
  card: ICharacterCard;
}

const CompletedCharacterCard: React.FC<CompletedCharacterCardProps> = ({ card }) => {
  const [character, setCharacter] = useState<ICharacter | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCharacterData = async () => {
      try {
        const charData = await api.character.getCharacterById(card.characterId);
        setCharacter(charData);
      } catch (error) {
        console.error("Failed to fetch character details for card:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCharacterData();
  }, [card.characterId]);

  if (isLoading) {
    return <div className={styles.card}>Loading...</div>;
  }

  if (!character) {
    return <div className={styles.card}>Error loading character data.</div>;
  }

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={character.pixelatedImageUrl || '/placeholders/default_character_image.png'} alt={character.name} className={styles.image} />
      </div>
      <div className={styles.content}>
        <h3 className={styles.name}>{character.name}</h3>
        <p className={styles.description}>{character.description}</p>
        <div className={styles.section}>
          <h4>고민</h4>
          <p>{character.problem}</p>
        </div>
        <div className={styles.section}>
          <h4>성격</h4>
          <p>{character.personality}</p>
        </div>
        <div className={styles.section}>
          <h4>대화 요약</h4>
          <p>{card.summary}</p>
        </div>
        <div className={styles.section}>
          <h4>결말</h4>
          <p className={styles.outcome}>{card.outcome}</p>
        </div>
        <div className={styles.emotionPieces}>
          <h4>획득한 감정 조각</h4>
          {/* TODO: Render actual EmotionPiece icons/keywords here based on card.emotionPieces */}
          <p>[감정 조각 아이콘/키워드]</p>
        </div>
      </div>
    </div>
  );
};

export default CompletedCharacterCard;