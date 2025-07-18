import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './AuthPage.module.css';

const AuthPage: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { login, register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isLoginView) {
        await login({ email, password });
      } else {
        await register({ email, password, nickname });
      }
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An unknown error occurred';
      setError(errorMessage);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.formWrapper}>
        <h2 className={styles.title}>{isLoginView ? '로그인' : '회원가입'}</h2>
        <p className={styles.subtitle}>
          {isLoginView ? '다시 당신의 이야기를 만나보세요.' : '새로운 이야기를 시작해보세요.'}
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLoginView && (
            <div className={styles.inputGroup}>
              <label htmlFor="nickname">닉네임</label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                placeholder="사용하실 닉네임을 입력하세요"
              />
            </div>
          )}
          <div className={styles.inputGroup}>
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="이메일 주소를 입력하세요"
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="비밀번호를 입력하세요"
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? '처리 중...' : (isLoginView ? '로그인' : '회원가입')}
          </button>
        </form>
        <div className={styles.toggleView}>
          {isLoginView ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
          <button onClick={() => setIsLoginView(!isLoginView)} className={styles.toggleButton}>
            {isLoginView ? '회원가입' : '로그인'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;