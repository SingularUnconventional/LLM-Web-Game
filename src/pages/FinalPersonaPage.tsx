import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { ICharacter } from '../types/api';
import styles from './FinalPersonaPage.module.css';

const FinalPersonaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [persona, setPersona] = useState<ICharacter | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchPersona = async () => {
      try {
        const fetchedPersona: ICharacter =
          await api.character.getCharacterById(id);
        setPersona(fetchedPersona);
      } catch (error) {
        console.error('Failed to fetch final persona:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPersona();
  }, [id]);

  if (isLoading) {
    return <div className={styles.loading}>최종 페르소나를 불러오는 중...</div>;
  }

  if (!persona) {
    return (
      <div className={styles.error}>페르소나 정보를 불러올 수 없습니다.</div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.personaCard}>
        <h1 className={styles.title}>진정한 페르소나</h1>
        <img
          src={persona.originalImageUrl}
          alt={persona.name}
          className={styles.image}
        />
        <h2 className={styles.name}>{persona.name}</h2>
        <p className={styles.description}>{persona.description}</p>
        <div className={styles.section}>
          <h3>핵심 질문</h3>
          <p>{persona.problem}</p>
        </div>
        <div className={styles.section}>
          <h3>성격</h3>
          <p>{persona.personality}</p>
        </div>
        <div className={styles.section}>
          <h3>첫 마디</h3>
          <blockquote className={styles.dialogue}>
            "{persona.initialDialogue}"
          </blockquote>
        </div>
        <Link to="/dashboard" className={styles.homeButton}>
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default FinalPersonaPage;
