import React from 'react';
import Sidebar from './Sidebar';
import styles from './MainLayout.module.css';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={styles.layoutContainer}>
      <Sidebar />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
