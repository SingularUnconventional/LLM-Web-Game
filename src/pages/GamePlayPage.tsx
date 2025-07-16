import React from 'react';
import CharacterDisplay from '@/components/CharacterDisplay/CharacterDisplay';
import ChatInterface from '@/components/ChatInterface/ChatInterface';
import EmotionLog from '@/components/EmotionLog';
import CharacterProfileCard from '@/components/CharacterProfileCard';
import { useGame } from '@/contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import styles from './GamePlayPage.module.css';

const GamePlayPage = () => {
  const { gameSession } = useGame();
  const navigate = useNavigate();

  if (!gameSession) {
    // If no game session, redirect to home or show a message
    navigate('/');
    return null;
  }

  return (
    <div className={styles.gamePlayPageContainer}>
      <h1>{gameSession.characterPersona.name}의 꿈</h1>
      <p>현재 감정: {gameSession.characterEmotionProgress?.currentEmotionState || '불러오는 중...'}</p>
      <div className={styles.dayNightCycle}>
        <p>Day: {gameSession.dayNightCycle.currentDay}</p>
        <p>{gameSession.dayNightCycle.isNight ? 'Night' : 'Day'}</p>
      </div>
      <CharacterDisplay />
      <ChatInterface />
      <CharacterProfileCard />
      <EmotionLog />
    </div>
  );
};

export default GamePlayPage;
