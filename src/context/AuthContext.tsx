'use client';
import { createContext, useEffect, useState, ReactNode } from 'react';
import { login as loginSvc, logout as logoutSvc, me as meSvc } from '../services/authService';
import { tokenStore } from '../services/tokenStore';
import { User } from '../interfaces/context/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // bootstrap de sesión: si hay tokens en LS, intenta /me
  useEffect(() => {
    (async () => {
      try {
        if (tokenStore.getAccess() && tokenStore.getRefresh()) {
          const { user } = await meSvc();
          setUser(user);
        }
      } catch {
        // tokens inválidos
        tokenStore.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const { user } = await loginSvc(email, password);
    setUser(user);
  };

  const logout = async () => {
    await logoutSvc();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
