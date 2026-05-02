import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getToken, removeToken, setToken } from '@/lib/api';
import { syncDatabase } from '@/lib/database/sync';

type User = { id: string; name: string; email: string; avatarUrl: string | null };

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getToken()
      .then((token) => (token ? api.auth.me() : null))
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken } = await api.auth.login({ email, password });
    await setToken(accessToken);
    const u = await api.auth.me();
    setUser(u);
    syncDatabase().catch(() => {});
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { accessToken } = await api.auth.register({ name, email, password });
    await setToken(accessToken);
    const u = await api.auth.me();
    setUser(u);
    syncDatabase().catch(() => {});
  }, []);

  const logout = useCallback(async () => {
    await removeToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
