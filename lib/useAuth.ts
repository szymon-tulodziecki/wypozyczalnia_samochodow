import { useState, useEffect, useCallback } from 'react';

export interface AuthSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize session from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('auth_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSession(parsed);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((data: AuthSession) => {
    setSession(data);
    sessionStorage.setItem('auth_session', JSON.stringify(data));
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    sessionStorage.removeItem('auth_session');
  }, []);

  return {
    session,
    isAuthenticated: !!session,
    loading,
    login,
    logout,
  };
}
