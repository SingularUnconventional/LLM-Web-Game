import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/base.scss';
import { GameProvider } from './contexts/GameContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
