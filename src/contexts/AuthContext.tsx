import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  ReactNode,
} from 'react';
import * as api from '../utils/api';
import { IUser, RegisterData, LoginData } from '../types/api';

interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const verifyAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const { data: userData } = await api.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Authentication check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  const handleAuthSuccess = (userData: IUser) => {
    if (userData.token) {
      localStorage.setItem('token', userData.token);
      // 토큰을 제외한 사용자 정보를 상태에 저장
      const { token, ...userToStore } = userData;
      setUser(userToStore as IUser);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await api.register(data);
      handleAuthSuccess(response.data);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error; // 에러를 다시 던져서 UI에서 처리할 수 있도록 함
    }
  };

  const login = async (data: LoginData) => {
    try {
      const response = await api.login(data);
      handleAuthSuccess(response.data);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};