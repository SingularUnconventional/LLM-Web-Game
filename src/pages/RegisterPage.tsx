import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { User } from '../types/api'; // Import User interface
import styles from './AuthPage.module.css';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<User>('/auth/register', { username, email, password });
      login(response);
      navigate('/play'); // Redirect to the main game area after successful registration
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h2>새로운 꿈 시작하기</h2>
        <p className={styles.subtitle}>당신의 이야기를 시작할 준비가 되셨나요?</p>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="사용자 이름"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? '가입 중...' : '회원가입'}
          </button>
        </form>
        <p className={styles.redirect}>
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
