// POS-F&B Auth Context

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthSession } from '../types/auth';
import { authService } from '../services/authService';
import { mockStorage } from '../mock/mockStorage';

interface AuthContextType {
  session: AuthSession;
  switchUser: (userId: string) => Promise<void>;
  forceChangePassword: (newPass: string) => Promise<void>;
  isOffline: boolean;
  toggleOffline: () => void;
  resetAllData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession>(authService.getCurrentSession());
  const [isOffline, setIsOffline] = useState<boolean>(authService.isOffline());

  useEffect(() => {
    // Lắng nghe thay đổi từ mockStorage
    const unsubscribe = mockStorage.subscribe(() => {
      setSession(authService.getCurrentSession());
      setIsOffline(authService.isOffline());
    });
    return () => unsubscribe();
  }, []);

  const switchUser = async (userId: string) => {
    const newSession = await authService.switchDemoUser(userId);
    setSession(newSession);
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
    setIsOffline(false);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
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
