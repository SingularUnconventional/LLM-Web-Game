import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { EmotionPiece, ICharacterCard, ICharacter } from '../types/api';
import styles from './EmotionLogPage.module.css';

interface EnrichedEmotionPiece extends EmotionPiece {
  character?: ICharacter;
}

const EmotionLogPage: React.FC = () => {
  const [pieces, setPieces] = useState<EnrichedEmotionPiece[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmotionPieces = async () => {
      try {
        const fetchedPieces =
          (await api.character.getEmotionPieces()) as EmotionPiece[];
        const cards = (await api.character.getCards()) as ICharacterCard[];

        const enrichedPieces = await Promise.all(
          fetchedPieces.map(async (piece: EmotionPiece) => {
            const relatedCard = cards.find(
              (c: ICharacterCard) => c._id === piece.characterCardId,
            );
            if (relatedCard) {
              const character = await api.character.getCharacterById(
                relatedCard.characterId,
              );
              return { ...piece, character };
            }
            return piece;
          }),
        );

        setPieces(enrichedPieces);
      } catch (error) {
        console.error('Failed to fetch emotion pieces:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmotionPieces();
  }, []);

  if (isLoading) {
    return <div className={styles.loading}>감정 기록을 불러오는 중...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>감정의 조각들</h1>
      <p className={styles.subtitle}>
        페르소나와의 대화를 통해 발견한 당신의 감정들입니다.
      </p>
      {pieces.length === 0 ? (
        <p className={styles.emptyMessage}>아직 수집된 감정 조각이 없습니다.</p>
      ) : (
        <div className={styles.logGrid}>
          {pieces.map((piece) => (
            <div key={piece._id} className={styles.pieceCard}>
              <div className={styles.keyword}>{piece.keyword}</div>
              {piece.character && (
                <div className={styles.source}>
                  <img
                    src={piece.character.pixelatedImageUrl}
                    alt={piece.character.name}
                  />
                  <span>{piece.character.name}</span>
                </div>
              )}
              <div className={styles.date}>
                {new Date(piece.acquiredAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmotionLogPage;
