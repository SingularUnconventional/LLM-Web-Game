import React from 'react';
// import Sidebar from './Sidebar'; // Temporarily removed
import styles from './MainLayout.module.css';
// import { useGame } from '../../contexts/GameContext'; // Temporarily removed

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={styles.layoutContainer}> {/* Keep layoutContainer for basic styling */}
      {/* <Sidebar /> */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
