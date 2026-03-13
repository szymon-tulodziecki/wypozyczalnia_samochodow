'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { authAPI } from '@/lib/api';

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, loading, session, logout: logoutSession } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await authAPI.logout();
      logoutSession();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Nie udało się się wylogować');
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#08090b',
        padding: '1rem',
      }}>
        <div style={{ fontSize: '1rem', color: '#4fa3d4' }}>Ładowanie...</div>
      </div>
    );
  }

  if (!isAuthenticated || !session) {
    return null;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:ital,wght@0,300;0,600;1,300&family=Barlow:wght@300;400&display=swap');

        :root {
          --blue:       #2e7ab5;
          --blue-light: #4fa3d4;
          --green:      #6dbf45;
          --green-dark: #4e9930;
          --card:       rgba(16, 22, 30, 0.85);
          --border:     rgba(46, 122, 181, 0.15);
          --text:       #dce8f0;
          --text-muted: #7a8e9e;
        }

        .account-page {
          min-height: 100vh;
          background: #08090b;
          padding: 5.5rem 1rem 3rem;
          position: relative;
          overflow: hidden;
        }

        .account-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(46,122,181,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46,122,181,0.025) 1px, transparent 1px);
          background-size: 52px 52px;
          pointer-events: none;
          z-index: 0;
        }

        .account-glow-1 {
          position: fixed;
          top: -10%; left: -10%;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(46,122,181,0.07) 0%, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }

        .account-glow-2 {
          position: fixed;
          bottom: -15%; right: -5%;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(109,191,69,0.05) 0%, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }

        .account-inner {
          position: relative;
          z-index: 1;
          max-width: 900px;
          margin: 0 auto;
        }

        /* Header */
        .account-head {
          margin-bottom: 2rem;
        }

        .account-eyebrow {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: var(--blue-light);
          margin-bottom: 0.4rem;
        }

        .account-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2rem, 5vw, 3rem);
          letter-spacing: 0.12em;
          background: linear-gradient(100deg, var(--blue-light) 0%, #c8dde8 45%, var(--green) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          margin: 0 0 0.35rem;
        }

        .account-subtitle {
          font-family: 'Barlow', sans-serif;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        /* Avatar row */
        .account-avatar-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px;
          margin-bottom: 1.75rem;
          backdrop-filter: blur(12px);
          flex-wrap: wrap;
        }

        .account-avatar-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .account-avatar {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--blue) 0%, var(--green-dark) 100%);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.4rem;
          color: #fff;
          flex-shrink: 0;
          box-shadow: 0 0 0 2px rgba(46,122,181,0.35);
        }

        .account-user-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .account-user-name {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 1.1rem;
          letter-spacing: 0.06em;
          color: var(--text);
        }

        .account-user-email {
          font-family: 'Barlow', sans-serif;
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .account-logout-btn {
          padding: 0.55rem 1.4rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          background: rgba(224,82,82,0.15);
          border: 1px solid rgba(224,82,82,0.6);
          color: #e05252;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .account-logout-btn:hover {
          background: rgba(224,82,82,0.25);
        }

        .account-logout-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Profile card */
        .profile-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 1.5rem;
          backdrop-filter: blur(12px);
        }

        .profile-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--blue-light);
          margin-bottom: 1.25rem;
        }

        .profile-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 1rem;
        }

        .profile-field-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.68rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .profile-field-value {
          font-family: 'Barlow', sans-serif;
          font-size: 0.9rem;
          color: var(--text);
        }

        /* Empty state */
        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px;
          color: var(--text-muted);
          font-family: 'Barlow', sans-serif;
        }

        @media (max-width: 600px) {
          .account-avatar-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .account-logout-btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="account-page">
        <div className="account-glow-1" />
        <div className="account-glow-2" />

        <div className="account-inner">
          <div className="account-head">
            <div className="account-eyebrow">Panel klienta</div>
            <h1 className="account-title">Moje konto</h1>
            <p className="account-subtitle">Zarządzaj swoimi danymi osobowymi</p>
          </div>

          <div className="account-avatar-row">
            <div className="account-avatar-left">
              <div className="account-avatar">
                {session.firstName?.[0]}{session.lastName?.[0]}
              </div>
              <div className="account-user-info">
                <div className="account-user-name">{session.firstName} {session.lastName}</div>
                <div className="account-user-email">{session.email}</div>
              </div>
            </div>
            <button
              className="account-logout-btn"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? 'Wylogowywanie...' : 'Wyloguj się'}
            </button>
          </div>

          <div className="profile-card">
            <h2 className="profile-title">Dane osobowe</h2>

            <div className="profile-field">
              <span className="profile-field-label">Imię</span>
              <span className="profile-field-value">{session.firstName}</span>
            </div>

            <div className="profile-field">
              <span className="profile-field-label">Nazwisko</span>
              <span className="profile-field-value">{session.lastName}</span>
            </div>

            <div className="profile-field">
              <span className="profile-field-label">Adres e-mail</span>
              <span className="profile-field-value">{session.email}</span>
            </div>

            <div className="empty-state" style={{ marginTop: '2rem' }}>
              <p>Więcej opcji edycji profilu wkrótce dostępne</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
