import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import type { JSX } from 'react/jsx-runtime';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages
import HomePage from './pages/HomePage';
import GamePlayPage from './pages/GamePlayPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PsychologyTestPage from './pages/PsychologyTestPage';

// A wrapper for protected routes that includes the main layout
const ProtectedLayout = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return <MainLayout>{children}</MainLayout>;
};

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected routes */}
            <Route path="/*" element={
              <ProtectedLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/play" element={<GamePlayPage />} />
                  <Route path="/welcome" element={<PsychologyTestPage />} />
                  {/* Add other protected routes like /sessions and /emotions here */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </ProtectedLayout>
            } />
          </Routes>
        </Router>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
