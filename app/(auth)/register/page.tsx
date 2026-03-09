'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: implement registration logic
    console.log('Register:', formData);
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
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 7rem 2rem 4rem;
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
          top: -15%; right: -5%;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(46,122,181,0.12) 0%, transparent 65%);
          pointer-events: none;
        }

        .auth-glow-green {
          position: absolute;
          bottom: -10%; left: -5%;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(109,191,69,0.07) 0%, transparent 65%);
          pointer-events: none;
        }

        .auth-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 500px;
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
            var(--green) 25%,
            var(--blue-light) 52%,
            var(--blue) 78%,
            transparent 100%
          );
        }

        .auth-card-body {
          padding: 2.5rem 2.2rem;
        }

        .auth-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.2rem;
          letter-spacing: 0.18em;
          background: linear-gradient(100deg, var(--blue-light) 0%, #c8dde8 45%, var(--green) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.4rem;
        }

        .auth-subtitle {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 300;
          font-style: italic;
          font-size: 0.72rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin: 0 0 2rem;
        }

        .auth-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .auth-field {
          margin-bottom: 1.2rem;
        }

        .auth-label {
          display: block;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.68rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-dim);
          margin-bottom: 0.5rem;
        }

        .auth-input-wrapper {
          position: relative;
        }

        .auth-input {
          width: 100%;
          padding: 0.7rem 1rem;
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

        .auth-agree {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          margin-bottom: 1.8rem;
          cursor: pointer;
        }

        .auth-agree input[type="checkbox"] {
          width: 14px; height: 14px;
          accent-color: var(--blue);
          cursor: pointer;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .auth-agree span {
          font-family: 'Barlow', sans-serif;
          font-size: 0.78rem;
          font-weight: 300;
          color: var(--text-dim);
          line-height: 1.5;
        }

        .auth-agree a {
          color: var(--blue-light);
          text-decoration: none;
          transition: color 0.2s;
        }

        .auth-agree a:hover {
          color: var(--green);
        }

        .auth-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          width: 100%;
          padding: 0.7rem 1.6rem;
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
          background: linear-gradient(110deg, var(--green-dark) 0%, var(--blue) 100%);
          transition: filter 0.3s, transform 0.25s;
        }

        .auth-btn:hover {
          filter: brightness(1.15);
          transform: translateY(-2px);
        }

        .auth-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          filter: none;
          transform: none;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.8rem 0;
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

        .auth-pw-hint {
          font-family: 'Barlow', sans-serif;
          font-size: 0.7rem;
          font-weight: 300;
          color: var(--text-muted);
          margin-top: 0.35rem;
        }

        @media (max-width: 520px) {
          .auth-card-body {
            padding: 2rem 1.4rem;
          }
          .auth-title {
            font-size: 1.8rem;
          }
          .auth-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }
      `}</style>

      <div className="auth-page">
        <div className="auth-glow-blue" />
        <div className="auth-glow-green" />

        <div className="auth-card">
          <div className="auth-card-accent" />
          <div className="auth-card-body">
            <h1 className="auth-title">Rejestracja</h1>
            <p className="auth-subtitle">Utwórz nowe konto w serwisie</p>

            <form onSubmit={handleSubmit}>
              <div className="auth-row">
                <div className="auth-field">
                  <label className="auth-label" htmlFor="firstName">Imię</label>
                  <div className="auth-input-wrapper">
                    <input
                      id="firstName"
                      type="text"
                      className="auth-input"
                      placeholder="Jan"
                      value={formData.firstName}
                      onChange={handleChange('firstName')}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="lastName">Nazwisko</label>
                  <div className="auth-input-wrapper">
                    <input
                      id="lastName"
                      type="text"
                      className="auth-input"
                      placeholder="Kowalski"
                      value={formData.lastName}
                      onChange={handleChange('lastName')}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="email">Adres e-mail</label>
                <div className="auth-input-wrapper">
                  <input
                    id="email"
                    type="email"
                    className="auth-input"
                    placeholder="jan.kowalski@example.com"
                    value={formData.email}
                    onChange={handleChange('email')}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="phone">Numer telefonu</label>
                <div className="auth-input-wrapper">
                  <input
                    id="phone"
                    type="tel"
                    className="auth-input"
                    placeholder="+48 000 000 000"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                  />
                </div>
              </div>

              <div className="auth-row">
                <div className="auth-field">
                  <label className="auth-label" htmlFor="password">Hasło</label>
                  <div className="auth-input-wrapper">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange('password')}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="auth-toggle-pw"
                      onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                    >
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                          <path d="M14.12 14.12a3 3 0 11-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="auth-pw-hint">Min. 8 znaków</p>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="confirmPassword">Potwierdź hasło</label>
                  <div className="auth-input-wrapper">
                    <input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange('confirmPassword')}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="auth-toggle-pw"
                      onClick={() => setShowConfirm(v => !v)}
                      aria-label={showConfirm ? 'Ukryj hasło' : 'Pokaż hasło'}
                    >
                      {showConfirm ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                          <path d="M14.12 14.12a3 3 0 11-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <label className="auth-agree">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                />
                <span>
                  Akceptuję{' '}
                  <Link href="#">regulamin serwisu</Link>{' '}
                  oraz{' '}
                  <Link href="#">politykę prywatności</Link>
                </span>
              </label>

              <button type="submit" className="auth-btn" disabled={!agreed}>
                Utwórz konto
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </form>

            <div className="auth-divider"><span>Lub</span></div>

            <p className="auth-footer-text">
              Masz już konto?{' '}
              <Link href="/login">Zaloguj się</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
