import React, { createContext, useContext } from 'react';
import { useLocalAuth, AppRole } from '@/hooks/useLocalAuth';

interface LocalUser {
  id: string;
  email: string;
  fullName?: string;
}

interface AuthContextType {
  user: LocalUser | null;
  session: { user: LocalUser } | null;
  role: AppRole | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  hasRole: (role: AppRole) => boolean;
  canEdit: () => boolean;
  isAdmin: () => boolean;
}

const LocalAuthContext = createContext<AuthContextType | null>(null);

export const useLocalAuthContext = () => {
  const context = useContext(LocalAuthContext);
  if (!context) {
    throw new Error('useLocalAuthContext must be used within a LocalAuthProvider');
  }
  return context;
};

export const LocalAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useLocalAuth();

  return (
    <LocalAuthContext.Provider value={auth}>
      {children}
    </LocalAuthContext.Provider>
  );
};
