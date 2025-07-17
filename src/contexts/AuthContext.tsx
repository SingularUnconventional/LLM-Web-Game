import React, { createContext, useState, useEffect, ReactNode, useCallback, useContext } from 'react';
import { api } from '../utils/api';
import { User } from '../types/api';

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  register: (credentials: RegisterCredentials) => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    }
    setIsLoading(false);
  }, []);

  const handleAuthResponse = (userData: any) => {
    const userWithToken = { id: userData.id, username: userData.username, email: userData.email, token: userData.token };
    localStorage.setItem('user', JSON.stringify(userWithToken));
    setUser(userWithToken);
  };

  const register = useCallback(async ({ username, email, password }: RegisterCredentials) => {
    const userData = await api.auth.register(username, email, password);
    handleAuthResponse(userData);
  }, []);

  const login = useCallback(async ({ email, password }: LoginCredentials) => {
    const userData = await api.auth.login(email, password);
    handleAuthResponse(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, logout }}>
      {isLoading ? <div>Loading authentication...</div> : children}
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
