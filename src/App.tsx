import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import { useContext } from 'react';


// Layout
import MainLayout from './components/layout/MainLayout';

// Pages
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import GamePlayPage from './pages/GamePlayPage';
import InitialCounselingPage from './pages/InitialCounselingPage';
import PersonaCollectionPage from './pages/PersonaCollectionPage';
import EmotionLogPage from './pages/EmotionLogPage';
import FinalPersonaPage from './pages/FinalPersonaPage';
import PsychologyTestPage from './pages/PsychologyTestPage';
import CharacterSelectionPage from './pages/CharacterSelectionPage';
import CounselingPage from './pages/CounselingPage';

// Wrapper for protected routes
const ProtectedRoute = () => {
  const auth = useContext(AuthContext);

  // AuthContext handles isLoading, so we just check for user
  return auth?.user ? <MainLayout><Outlet /></MainLayout> : <Navigate to="/auth" />;
};

// Wrapper for public routes (redirects if logged in)
const PublicRoute = () => {
  const auth = useContext(AuthContext);

  // AuthContext handles isLoading, so we just check for user
  return auth?.user ? <Navigate to="/dashboard" /> : <Outlet />;
};


function App() {
  return (
    <Router>
      <AuthProvider>
        <GameProvider>
          <Routes>
            {/* Public routes that redirect if logged in */}
            <Route element={<PublicRoute />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
            </Route>

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/character-selection" element={<CharacterSelectionPage />} />
              <Route path="/initial-counseling" element={<InitialCounselingPage />} />
              <Route path="/play" element={<GamePlayPage />} />
              <Route path="/persona-collection" element={<PersonaCollectionPage />} />
              <Route path="/emotion-log" element={<EmotionLogPage />} />
              <Route path="/persona/:id" element={<FinalPersonaPage />} />
              <Route path="/psychology-test" element={<PsychologyTestPage />} />
              <Route path="/counseling" element={<CounselingPage />} />
            </Route>
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </GameProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;