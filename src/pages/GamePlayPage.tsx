import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import CharacterDisplay from '../components/CharacterDisplay/CharacterDisplay';
import ChatInterface from '../components/ChatInterface/ChatInterface';
import CharacterProfileCard from '../components/CharacterProfileCard';
import EmotionLog from '../components/EmotionLog';
import styles from './GamePlayLayout.module.css'; // Using a new, non-conflicting style module

const GamePlayPage: React.FC = () => {
  const { gameSession } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    if (!gameSession) {
      console.log('No game session found, redirecting to home.');
      navigate('/');
    }
  }, [gameSession, navigate]);

  if (!gameSession) {
    return null; 
  }

  return (
    <div className={styles.gameContainer}>
      <div className={styles.leftPanel}>
        <CharacterDisplay />
        <ChatInterface />
      </div>
      <div className={styles.rightPanel}>
        <CharacterProfileCard />
        <EmotionLog />
      </div>
    </div>
  );
};

export default GamePlayPage;
