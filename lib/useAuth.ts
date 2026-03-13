'use client';

import { useEffect, useState } from 'react';

export interface AuthSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

const SESSION_KEY = 'motion_drive_session';

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSession(parsed);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (sessionData: AuthSession) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    setSession(sessionData);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  const isAuthenticated = session !== null;

  return { session, isAuthenticated, loading, login, logout };
}
