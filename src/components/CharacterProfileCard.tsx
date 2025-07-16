import React from 'react';
import { useGame } from '@/contexts/GameContext';
import styles from './CharacterProfileCard.module.css';

const CharacterProfileCard: React.FC = () => {
  const { gameSession } = useGame();

  if (!gameSession) {
    return <div className={styles.profileCardContainer}>캐릭터 프로필을 불러오는 중...</div>;
  }

  const { characterPersona } = gameSession;

  return (
    <div className={styles.profileCardContainer}>
      <h2>{characterPersona.name}의 프로필</h2>
      <div className={styles.profileContent}>
        <p><strong>핵심 고민:</strong> {characterPersona.core_concern}</p>
        <p><strong>성격 특성:</strong> {characterPersona.personality_traits.join(', ')}</p>
        <p><strong>대화 스타일:</strong> {characterPersona.dialogue_style}</p>
        <p><strong>가장 큰 두려움:</strong> {characterPersona.primary_fear}</p>
        <p><strong>대인 관계 경계:</strong> {characterPersona.interpersonal_boundary}</p>
        <p><strong>혼자 있을 때 행동:</strong> {characterPersona.behavior_when_alone}</p>
        <p><strong>세계 요약:</strong> {characterPersona.setting_summary}</p>
        <p><strong>부재 개념:</strong> {characterPersona.absent_concepts.join(', ')}</p>
        <p><strong>초기 기억:</strong> {characterPersona.initial_long_term_memory.join(', ')}</p>
      </div>
    </div>
  );
};

export default CharacterProfileCard;
