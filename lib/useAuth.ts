'use client';

import { useEffect, useState, useCallback } from 'react';

export interface AuthSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: 'root' | 'agent' | 'klient';
}

const SESSION_KEY = 'motion_drive_session';
const AUTH_CHANGE_EVENT = 'motion_drive_auth_change';

function readSession(): AuthSession | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? (JSON.parse(stored) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(() => readSession());
  const [loading] = useState(false);

  useEffect(() => {
    const onAuthChange = () => setSession(readSession());
    window.addEventListener(AUTH_CHANGE_EVENT, onAuthChange);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, onAuthChange);
  }, []);

  const login = useCallback((sessionData: AuthSession) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    setSession(sessionData);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }, []);

  const isAuthenticated = session !== null;

  return { session, isAuthenticated, loading, login, logout };
}
