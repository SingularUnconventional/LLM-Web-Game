import React, { useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { AuthProvider, AuthContext, useAuth } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';

// Pages
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import GamePlayPage from './pages/GamePlayPage';
import PsychologyTestPage from './pages/PsychologyTestPage';
// import EndingPage from './pages/EndingPage'; // 엔딩 페이지는 필요시 추가

// 보호된 라우트 Wrapper
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // 인증 상태 확인 중 로딩 표시
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// 공개 라우트 Wrapper (로그인 시 홈으로 리디렉션)
const PublicRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};


function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <Router>
          <Routes>
            {/* 로그인/회원가입 페이지만 있는 공개 라우트 */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<AuthPage />} />
            </Route>

            {/* 로그인이 필요한 보호된 라우트 */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/psychology-test" element={<PsychologyTestPage />} />
              <Route path="/character/:characterId" element={<GamePlayPage />} />
              {/* <Route path="/ending/:characterId" element={<EndingPage />} /> */}
            </Route>

            {/* 일치하는 라우트가 없을 경우 */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;