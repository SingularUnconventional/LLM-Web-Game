import React from 'react';
import Sidebar from './Sidebar';
import styles from './MainLayout.module.css';
import { useGame } from '../../contexts/GameContext';
import EmotionLog from '../EmotionLog';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { gameState, characterCards } = useGame();

  return (
    <div className={styles.layoutContainer}>
      <Sidebar />
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.gameInfo}>
            {gameState && (
              <p>{`${gameState.currentDay}일차 ${gameState.gameState === 'night' ? '밤' : '낮'}`}</p>
            )}
          </div>
          <div className={styles.emotionShards}>
            <EmotionLog characterCards={characterCards} />
          </div>
          {/* 메뉴 아이콘은 Sidebar에 포함될 수 있음 */}
        </header>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
