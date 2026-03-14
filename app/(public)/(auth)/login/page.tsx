'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login: storeSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('registered') === '1') {
      setSuccessMessage('Konto zostało utworzone. Możesz się teraz zalogować.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.login(email, password);
      const profile = await authAPI.getProfile();
      
      // Zapisz sesję z minimum danych prywatnych
      storeSession({
        id: profile.id,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
      });
      
      router.push('/konto');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Błąd logowania');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:ital,wght@0,300;0,600;1,300&family=Barlow:wght@300;400&display=swap');

        :root {
          --blue:       #2e7ab5;
          --blue-light: #4fa3d4;
          --green:      #6dbf45;
          --green-dark: #4e9930;
          --surface:    rgba(14, 18, 24, 0.92);
          --text-muted: #5a6270;
          --text-dim:   #9aa3ae;
        }

        .auth-page {
          position: relative;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5rem 2rem 1.5rem;
          background: #08090b;
          overflow: hidden;
        }

        .auth-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(46,122,181,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46,122,181,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .auth-glow-blue {
          position: absolute;
          top: -15%; left: -5%;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(46,122,181,0.12) 0%, transparent 65%);
          pointer-events: none;
        }

        .auth-glow-green {
          position: absolute;
          bottom: -10%; right: -5%;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(109,191,69,0.07) 0%, transparent 65%);
          pointer-events: none;
        }

        .auth-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          background: rgba(14, 18, 24, 0.85);
          backdrop-filter: blur(20px) saturate(1.6);
          -webkit-backdrop-filter: blur(20px) saturate(1.6);
          border: 1px solid rgba(46, 122, 181, 0.15);
          border-radius: 2px;
          overflow: hidden;
        }

        .auth-card-accent {
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            var(--blue) 25%,
            var(--blue-light) 48%,
            var(--green) 72%,
            transparent 100%
          );
        }

        .auth-card-body {
          padding: 1.6rem 2rem 1.8rem;
        }

        .auth-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.9rem;
          letter-spacing: 0.18em;
          background: linear-gradient(100deg, var(--blue-light) 0%, #c8dde8 45%, var(--green) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.2rem;
        }

        .auth-subtitle {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 300;
          font-style: italic;
          font-size: 0.7rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin: 0 0 1rem;
        }

        .auth-field {
          margin-bottom: 0.8rem;
        }

        .auth-label {
          display: block;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.65rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-dim);
          margin-bottom: 0.28rem;
        }

        .auth-input-wrapper {
          position: relative;
        }

        .auth-input {
          width: 100%;
          padding: 0.45rem 1rem;
          font-family: 'Barlow', sans-serif;
          font-size: 0.88rem;
          font-weight: 300;
          color: #dce8f0;
          background: rgba(8, 9, 11, 0.7);
          border: 1px solid #1e2830;
          border-radius: 1px;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
          box-sizing: border-box;
        }

        .auth-input::placeholder {
          color: #2a3440;
        }

        .auth-input:focus {
          border-color: var(--blue);
          box-shadow: 0 0 0 2px rgba(46,122,181,0.12), 0 0 20px rgba(46,122,181,0.06);
        }

        .auth-toggle-pw {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          padding: 2px;
          display: flex;
          transition: color 0.2s;
        }

        .auth-toggle-pw:hover {
          color: var(--blue-light);
        }

        .auth-extras {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .auth-remember {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .auth-remember input[type="checkbox"] {
          width: 14px; height: 14px;
          accent-color: var(--blue);
          cursor: pointer;
        }

        .auth-remember span {
          font-family: 'Barlow', sans-serif;
          font-size: 0.78rem;
          font-weight: 300;
          color: var(--text-dim);
        }

        .auth-forgot {
          font-family: 'Barlow', sans-serif;
          font-size: 0.78rem;
          font-weight: 300;
          color: var(--blue-light);
          text-decoration: none;
          transition: color 0.2s;
        }

        .auth-forgot:hover {
          color: var(--green);
        }

        .auth-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          width: 100%;
          padding: 0.55rem 1.6rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.78rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #fff;
          border: none;
          cursor: pointer;
          overflow: hidden;
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          background: linear-gradient(110deg, var(--blue) 0%, var(--green-dark) 100%);
          transition: filter 0.3s, transform 0.25s;
        }

        .auth-btn:hover {
          filter: brightness(1.15);
          transform: translateY(-2px);
        }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1rem 0;
        }

        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #1e2830;
        }

        .auth-divider span {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 300;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .auth-footer-text {
          text-align: center;
          font-family: 'Barlow', sans-serif;
          font-size: 0.82rem;
          font-weight: 300;
          color: var(--text-dim);
        }

        .auth-footer-text a {
          color: var(--blue-light);
          text-decoration: none;
          font-weight: 400;
          transition: color 0.2s;
        }

        .auth-footer-text a:hover {
          color: var(--green);
        }

        /* ── Alerts ── */
        .auth-alert {
          padding: 0.65rem 1rem;
          margin-bottom: 0.8rem;
          border-radius: 2px;
          font-family: 'Barlow', sans-serif;
          font-size: 0.82rem;
          font-weight: 400;
          border-left: 3px solid;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .auth-alert.error {
          background: rgba(220, 53, 69, 0.1);
          color: #ff6b6b;
          border-color: #ff6b6b;
        }

        .auth-alert.success {
          background: rgba(109, 191, 69, 0.1);
          color: #51cf66;
          border-color: #51cf66;
        }

        @media (max-width: 520px) {
          .auth-card-body {
            padding: 2rem 1.4rem;
          }
          .auth-title {
            font-size: 1.8rem;
          }
        }
      `}</style>

      <div className="auth-page">
        <div className="auth-glow-blue" />
        <div className="auth-glow-green" />

        <div className="auth-card">
          <div className="auth-card-accent" />
          <div className="auth-card-body">
            <h1 className="auth-title">Logowanie</h1>
            <p className="auth-subtitle">Zaloguj się do swojego konta</p>

            <form onSubmit={handleSubmit}>
              {error && <div className="auth-alert error">{error}</div>}
              {successMessage && (
                <p style={{ color: '#86efac', fontSize: '0.82rem', marginBottom: '0.75rem', fontFamily: 'Barlow, sans-serif' }}>
                  {successMessage}
                </p>
              )}

              <div className="auth-field">
                <label className="auth-label" htmlFor="email">Adres e-mail</label>
                <div className="auth-input-wrapper">
                  <input
                    id="email"
                    type="email"
                    className="auth-input"
                    placeholder="jan.kowalski@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="password">Hasło</label>
                <div className="auth-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-toggle-pw"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                        <path d="M14.12 14.12a3 3 0 11-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="auth-extras">
                <label className="auth-remember">
                  <input type="checkbox" />
                  <span>Zapamiętaj mnie</span>
                </label>
                <Link href="#" className="auth-forgot">Zapomniałeś hasła?</Link>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Logowanie…' : 'Zaloguj się'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </form>

            <div className="auth-divider"><span>Lub</span></div>

            <p className="auth-footer-text">
              Nie masz jeszcze konta?{' '}
              <Link href="/register">Zarejestruj się</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
