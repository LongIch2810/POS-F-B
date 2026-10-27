// POS-F&B Auth Context

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthSession } from '../types/auth';
import { authService } from '../services/authService';
import { mockStorage } from '../mock/mockStorage';

interface AuthContextType {
  session: AuthSession;
  isAuthenticated: boolean;
  login: (username: string, password?: string) => Promise<void>;
  logout: () => void;
  switchUser: (userId: string) => Promise<void>;
  forceChangePassword: (newPass: string) => Promise<void>;
  isOffline: boolean;
  toggleOffline: () => void;
  resetAllData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession>(authService.getCurrentSession());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('pos_auth_status') !== 'logged_out';
  });
  const [isOffline, setIsOffline] = useState<boolean>(authService.isOffline());

  useEffect(() => {
    // Lắng nghe thay đổi từ mockStorage
    const unsubscribe = mockStorage.subscribe(() => {
      setSession(authService.getCurrentSession());
      setIsOffline(authService.isOffline());
    });
    return () => unsubscribe();
  }, []);

  const login = async (username: string, password?: string) => {
    const newSession = await authService.login(username, password);
    setSession(newSession);
    localStorage.removeItem('pos_auth_status');
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.setItem('pos_auth_status', 'logged_out');
    setIsAuthenticated(false);
  };

  const switchUser = async (userId: string) => {
    const newSession = await authService.switchDemoUser(userId);
    setSession(newSession);
    localStorage.removeItem('pos_auth_status');
    setIsAuthenticated(true);
  };

  const forceChangePassword = async (newPass: string) => {
    await authService.forceChangePassword(newPass);
    setSession(authService.getCurrentSession());
  };

  const toggleOffline = () => {
    const val = authService.toggleOfflineMode();
    setIsOffline(val);
  };

  const resetAllData = () => {
    authService.resetAllData();
    setSession(authService.getCurrentSession());
    setIsAuthenticated(true);
    setIsOffline(false);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated,
        login,
        logout,
        switchUser,
        forceChangePassword,
        isOffline,
        toggleOffline,
        resetAllData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider');
  }
  return context;
};
