import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // 1. Check URL for token first (synchronous so router doesn't intercept it)
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    
    if (tokenFromUrl) {
      localStorage.setItem('reachinbox_token', tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
      return true;
    }
    
    // 2. Fallback to local storage
    return !!localStorage.getItem('reachinbox_token');
  });

  useEffect(() => {
    if (isAuthenticated && !user) {
      setLoading(true);
      authService.getCurrentUser()
        .then(userData => {
          setUser(userData);
        })
        .catch(err => {
          console.error("Failed to fetch user:", err);
          setIsAuthenticated(false);
          localStorage.removeItem('reachinbox_token');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isAuthenticated, user]);

  const login = useCallback(async () => {
    setLoading(true);
    try {
      const url = await authService.getGoogleAuthUrl();
      window.location.href = url; // Redirect to backend
    } catch {
      setLoading(false);
      throw new Error('Failed to get auth URL');
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
