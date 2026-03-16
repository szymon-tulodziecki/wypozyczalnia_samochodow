"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (authError) {
      setError('Nieprawidłowy email lub hasło.');
      return;
    }

    router.push('/admin/dashboard');
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
          --red:        #e05252;
          --text-muted: #5a6270;
          --text-dim:   #9aa3ae;
        }
        .adm-page {
          position: relative;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5rem 2rem 1.5rem;
          background: #08090b;
          overflow: hidden;
        }
        .adm-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(46,122,181,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46,122,181,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }
        .adm-glow-blue {
          position: absolute;
          top: -15%; left: -5%;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(46,122,181,0.1) 0%, transparent 65%);
          pointer-events: none;
        }
        .adm-glow-red {
          position: absolute;
          bottom: -10%; right: -5%;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(224,82,82,0.06) 0%, transparent 65%);
          pointer-events: none;
        }
        .adm-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 400px;
          background: rgba(14, 18, 24, 0.9);
          backdrop-filter: blur(20px) saturate(1.6);
          -webkit-backdrop-filter: blur(20px) saturate(1.6);
          border: 1px solid rgba(46, 122, 181, 0.15);
          border-radius: 2px;
          overflow: hidden;
        }
        .adm-card-accent {
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(224,82,82,0.6) 20%,
            var(--blue) 48%,
            var(--blue-light) 72%,
            transparent 100%
          );
        }
        .adm-card-body {
          padding: 1.6rem 2rem 1.8rem;
        }
        .adm-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.6rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--red);
          background: rgba(224,82,82,0.08);
          border: 1px solid rgba(224,82,82,0.2);
          padding: 0.2rem 0.6rem;
          border-radius: 2px;
          margin-bottom: 0.8rem;
        }
        .adm-badge::before {
          content: '';
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--red);
          box-shadow: 0 0 6px var(--red);
        }
        .adm-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.9rem;
          letter-spacing: 0.18em;
          background: linear-gradient(100deg, #fff 0%, #c8dde8 45%, var(--blue-light) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.2rem 0;
        }
        .adm-subtitle {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 300;
          font-style: italic;
          font-size: 0.7rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin: 0 0 1.4rem;
        }
        .adm-field { margin-bottom: 0.9rem; }
        .adm-label {
          display: block;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.65rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-dim);
          margin-bottom: 0.28rem;
        }
        .adm-input-wrapper { position: relative; }
        .adm-input {
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
        .adm-input::placeholder { color: #2a3440; }
        .adm-input:focus {
          border-color: var(--blue);
          box-shadow: 0 0 0 2px rgba(46,122,181,0.12);
        }
        .adm-toggle-pw {
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
        .adm-toggle-pw:hover { color: var(--blue-light); }
        .adm-error {
          font-family: 'Barlow', sans-serif;
          font-size: 0.78rem;
          font-weight: 300;
          color: var(--red);
          background: rgba(224,82,82,0.07);
          border: 1px solid rgba(224,82,82,0.2);
          border-radius: 2px;
          padding: 0.5rem 0.8rem;
          margin-bottom: 0.9rem;
        }
        .adm-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          width: 100%;
          margin-top: 0.6rem;
          padding: 0.55rem 1.6rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.78rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #fff;
          border: none;
          cursor: pointer;
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          background: linear-gradient(110deg, #c0392b 0%, var(--blue) 100%);
          transition: filter 0.3s, transform 0.25s;
        }
        .adm-btn:hover:not(:disabled) {
          filter: brightness(1.15);
          transform: translateY(-2px);
        }
        .adm-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        @media (max-width: 520px) {
          .adm-card-body { padding: 1.4rem 1.4rem 1.6rem; }
          .adm-title { font-size: 1.6rem; }
        }
      `}</style>

      <div className="adm-page">
        <div className="adm-glow-blue" />
        <div className="adm-glow-red" />

        <div className="adm-card">
          <div className="adm-card-accent" />
          <div className="adm-card-body">
            <div className="adm-badge">Panel administratora</div>
            <h1 className="adm-title">Logowanie</h1>
            <p className="adm-subtitle">Dostęp tylko dla autoryzowanych użytkowników</p>

            <form onSubmit={handleSubmit}>
              {error && <div className="adm-error">{error}</div>}

              <div className="adm-field">
                <label className="adm-label" htmlFor="email">Adres e-mail</label>
                <div className="adm-input-wrapper">
                  <input
                    id="email"
                    type="email"
                    className="adm-input"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="adm-field">
                <label className="adm-label" htmlFor="password">Hasło</label>
                <div className="adm-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="adm-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    className="adm-toggle-pw"
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

              <button type="submit" className="adm-btn" disabled={loading}>
                {loading ? 'Logowanie...' : 'Zaloguj się'}
                {!loading && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
