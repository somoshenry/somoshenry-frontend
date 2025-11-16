'use client';
import { createContext, useEffect, useState, ReactNode } from 'react';
import { login as loginSvc, logout as logoutSvc, me as meSvc, handleUrlTokenLogin as handleUrlTokenLoginSvc } from '../services/authService';
import { tokenStore } from '../services/tokenStore';
import { User } from '../interfaces/context/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  handleUrlTokenLogin: (token: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const token = tokenStore.getAccess();
        if (token) {
          const { user } = await meSvc();
          setUser(user);
        }
      } catch (error) {
        console.error('Error al validar sesión:', error);
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
    router.push('/');
  };

  // para refrescar user después del pago
  const refreshUser = async () => {
    try {
      const { user } = await meSvc();
      setUser(user);
    } catch (error) {
      console.error('Error al refrescar user:', error);
    }
  };

  const handleUrlTokenLogin = async (token: string) => {
    const { user } = await handleUrlTokenLoginSvc(token);
    setUser(user);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout, handleUrlTokenLogin, refreshUser }}>{children}</AuthContext.Provider>;
}
