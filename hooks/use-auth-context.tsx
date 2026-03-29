import { createContext, useContext } from 'react';

export type AuthData = {
  claims?: Record<string, any> | null;
  user?: any | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  ready: boolean;
  hasOnboarded: boolean;
  completeOnboarding: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthData>({
  claims: undefined,
  user: undefined,
  isLoading: true,
  isLoggedIn: false,
  ready: false,
  hasOnboarded: false,
  completeOnboarding: async () => { },
  logout: async () => { },
});

export const useAuthContext = () => useContext(AuthContext);
