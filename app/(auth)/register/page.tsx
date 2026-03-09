'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

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
  const [modal, setModal] = useState<string | null>(null);

  const handleChange = (field: string) => (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
          --text-muted: #5a6270;
          --text-dim:   #9aa3ae;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .reg-wrap {
          display: flex;
          min-height: 100vh;
          height: 100vh;
          background: #08090b;
          padding-top: 72px;
        }

        /* ── LEFT PANEL ── */
        .reg-photo {
          position: relative;
          flex: 0 0 50%;
          height: 100%;
          overflow: hidden;
        }

        .reg-photo img {
          object-fit: cover !important;
          object-position: center !important;
        }

        /* fade to black toward right only */
        .reg-photo::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, transparent 55%, #08090b 100%);
        }

        /* quote / badge on photo */
        .reg-photo-badge {
          position: absolute;
          bottom: 2.5rem;
          left: 2rem;
          z-index: 2;
        }

        .reg-photo-badge-line {
          width: 36px;
          height: 2px;
          background: linear-gradient(90deg, var(--blue), var(--green));
          margin-bottom: 0.6rem;
        }

        .reg-photo-badge-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.55rem;
          letter-spacing: 0.14em;
          background: linear-gradient(100deg, var(--blue-light), #fff 60%, var(--green));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
        }

        .reg-photo-badge-sub {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 300;
          font-style: italic;
          font-size: 0.62rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(220,232,240,0.55);
          margin-top: 0.3rem;
        }

        /* ── RIGHT PANEL ── */
        .reg-form-panel {
          flex: 0 0 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem 2.5rem;
          overflow-y: auto;
          background: #08090b;
          position: relative;
        }

        /* subtle grid on form side */
        .reg-form-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(46,122,181,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46,122,181,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .reg-form-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 380px;
        }

        /* accent line on top */
        .reg-accent-line {
          height: 2px;
          margin-bottom: 0.8rem;
          background: linear-gradient(
            90deg,
            var(--blue) 0%,
            var(--blue-light) 45%,
            var(--green) 100%
          );
          width: 48px;
        }

        .auth-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.7rem;
          letter-spacing: 0.18em;
          background: linear-gradient(100deg, var(--blue-light) 0%, #c8dde8 45%, var(--green) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.1rem;
        }

        .auth-subtitle {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 300;
          font-style: italic;
          font-size: 0.65rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin: 0 0 0.8rem;
        }

        .auth-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.6rem;
        }

        .auth-field { margin-bottom: 0.5rem; }

        .auth-label {
          display: block;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.65rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-dim);
          margin-bottom: 0.4rem;
        }

        .auth-input-wrapper { position: relative; }

        .auth-input {
          width: 100%;
          padding: 0.45rem 1rem;
          font-family: 'Barlow', sans-serif;
          font-size: 0.86rem;
          font-weight: 300;
          color: #dce8f0;
          background: rgba(8, 9, 11, 0.7);
          border: 1px solid #1e2830;
          border-radius: 1px;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        .auth-input::placeholder { color: #2a3440; }

        .auth-input:focus {
          border-color: var(--blue);
          box-shadow: 0 0 0 2px rgba(46,122,181,0.12);
        }

        .auth-toggle-pw {
          position: absolute;
          right: 0.75rem; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--text-muted); padding: 2px;
          display: flex; transition: color 0.2s;
        }
        .auth-toggle-pw:hover { color: var(--blue-light); }

        .auth-agree {
          display: flex; align-items: flex-start; gap: 0.6rem;
          margin-bottom: 0.6rem; cursor: pointer;
        }
        .auth-agree input[type="checkbox"] {
          width: 14px; height: 14px;
          accent-color: var(--blue);
          cursor: pointer; margin-top: 2px; flex-shrink: 0;
        }
        .auth-agree span {
          font-family: 'Barlow', sans-serif;
          font-size: 0.76rem; font-weight: 300;
          color: var(--text-dim); line-height: 1.5;
        }
        .auth-agree button {
          background: none; border: none; padding: 0;
          color: var(--blue-light); cursor: pointer;
          font-family: inherit; font-size: inherit;
          font-weight: 400; text-decoration: underline;
        }

        .auth-btn {
          position: relative;
          display: flex; align-items: center; justify-content: center; gap: 0.6rem;
          width: 100%;
          padding: 0.55rem 1.6rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600; font-size: 0.78rem;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: #fff; border: none; cursor: pointer;
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          background: linear-gradient(110deg, var(--green-dark) 0%, var(--blue) 100%);
          transition: filter 0.3s, transform 0.25s;
        }
        .auth-btn:hover { filter: brightness(1.15); transform: translateY(-2px); }
        .auth-btn:disabled { opacity: 0.4; cursor: not-allowed; filter: none; transform: none; }

        .auth-divider {
          display: flex; align-items: center; gap: 1rem; margin: 0.6rem 0;
        }
        .auth-divider::before, .auth-divider::after {
          content: ''; flex: 1; height: 1px; background: #1e2830;
        }
        .auth-divider span {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 300; font-size: 0.65rem;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--text-muted);
        }

        .auth-footer-text {
          text-align: center;
          font-family: 'Barlow', sans-serif;
          font-size: 0.82rem; font-weight: 300;
          color: var(--text-dim);
        }
        .auth-footer-text a {
          color: var(--blue-light); text-decoration: none; font-weight: 400;
          transition: color 0.2s;
        }
        .auth-footer-text a:hover { color: var(--green); }

        .auth-pw-hint {
          font-family: 'Barlow', sans-serif;
          font-size: 0.68rem; font-weight: 300;
          color: var(--text-muted); margin-top: 0.2rem;
        }

        /* ── Modal ── */
        .reg-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(4px);
          z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem;
        }
        .reg-modal {
          background: #0d1117;
          border: 1px solid rgba(79,163,212,0.2);
          border-radius: 12px;
          max-width: 600px; width: 100%; max-height: 78vh;
          display: flex; flex-direction: column;
          position: relative; overflow: hidden;
        }
        .reg-modal::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, var(--blue), var(--green));
        }
        .reg-modal-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.2rem 1.5rem 0.8rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .reg-modal-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.4rem; letter-spacing: 0.08em; color: #fff;
        }
        .reg-modal-close {
          background: none;
          border: 1px solid rgba(255,255,255,0.1);
          color: #7a8e9e; width: 26px; height: 26px;
          border-radius: 5px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.95rem; transition: border-color 0.2s, color 0.2s;
        }
        .reg-modal-close:hover { border-color: rgba(79,163,212,0.4); color: #fff; }
        .reg-modal-body {
          padding: 1.2rem 1.5rem 1.5rem;
          overflow-y: auto;
          font-family: 'Barlow', sans-serif;
          font-weight: 300; font-size: 0.83rem;
          line-height: 1.75; color: #b8c4d0; flex: 1;
        }
        .reg-modal-body h3 {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600; font-size: 0.68rem;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--blue-light); margin: 1.1rem 0 0.35rem;
        }
        .reg-modal-body h3:first-child { margin-top: 0; }
        .reg-modal-body p { margin-bottom: 0.5rem; }

        /* ── Responsive ── */
        @media (max-width: 860px) {
          .reg-wrap {
            flex-direction: column;
            height: auto;
            min-height: 100vh;
          }

          .reg-photo {
            flex: 0 0 240px;
            height: 240px;
            width: 100%;
          }

          .reg-photo::after {
            background: linear-gradient(to bottom, transparent 40%, #08090b 100%);
          }

          .reg-photo-badge { bottom: 1.2rem; left: 1.25rem; }
          .reg-photo-badge-text { font-size: 1.2rem; }

          .reg-form-panel {
            flex: 1;
            width: 100%;
            padding: 2rem 1.25rem 3rem;
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {
          .reg-photo { flex: 0 0 200px; height: 200px; }
          .reg-photo-badge { display: none; }
          .auth-row { grid-template-columns: 1fr; gap: 0; }
        }
      `}</style>

      <div className="reg-wrap">

        {/* ── LEFT: Photo ── */}
        <div className="reg-photo">
          <Image
            src="/porsche.jpg"
            alt="Luxury car"
            fill
            sizes="50vw"
            priority
          />
        </div>

        {/* ── RIGHT: Form ── */}
        <div className="reg-form-panel">
          <div className="reg-form-inner">
            <div className="reg-accent-line" />
            <h1 className="auth-title">Rejestracja</h1>
            <p className="auth-subtitle">Utwórz nowe konto w serwisie</p>

            <form onSubmit={handleSubmit}>
              <div className="auth-row">
                <div className="auth-field">
                  <label className="auth-label" htmlFor="firstName">Imię</label>
                  <div className="auth-input-wrapper">
                    <input id="firstName" type="text" className="auth-input"
                      placeholder="Jan" value={formData.firstName}
                      onChange={handleChange('firstName')} required />
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="lastName">Nazwisko</label>
                  <div className="auth-input-wrapper">
                    <input id="lastName" type="text" className="auth-input"
                      placeholder="Kowalski" value={formData.lastName}
                      onChange={handleChange('lastName')} required />
                  </div>
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="email">Adres e-mail</label>
                <div className="auth-input-wrapper">
                  <input id="email" type="email" className="auth-input"
                    placeholder="jan.kowalski@example.com" value={formData.email}
                    onChange={handleChange('email')} required />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="phone">Numer telefonu</label>
                <div className="auth-input-wrapper">
                  <input id="phone" type="tel" className="auth-input"
                    placeholder="+48 000 000 000" value={formData.phone}
                    onChange={handleChange('phone')} />
                </div>
              </div>

              <div className="auth-row">
                <div className="auth-field">
                  <label className="auth-label" htmlFor="password">Hasło</label>
                  <div className="auth-input-wrapper">
                    <input id="password" type={showPassword ? 'text' : 'password'}
                      className="auth-input" placeholder="••••••••"
                      value={formData.password} onChange={handleChange('password')}
                      required minLength={8} style={{ paddingRight: '2.2rem' }} />
                    <button type="button" className="auth-toggle-pw"
                      onClick={() => setShowPassword(v => !v)}>
                      {showPassword
                        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><path d="M14.12 14.12a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                  <p className="auth-pw-hint">Min. 8 znaków</p>
                </div>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="confirmPassword">Potwierdź hasło</label>
                  <div className="auth-input-wrapper">
                    <input id="confirmPassword" type={showConfirm ? 'text' : 'password'}
                      className="auth-input" placeholder="••••••••"
                      value={formData.confirmPassword} onChange={handleChange('confirmPassword')}
                      required minLength={8} style={{ paddingRight: '2.2rem' }} />
                    <button type="button" className="auth-toggle-pw"
                      onClick={() => setShowConfirm(v => !v)}>
                      {showConfirm
                        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><path d="M14.12 14.12a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                </div>
              </div>

              <label className="auth-agree">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                <span>
                  Akceptuję{' '}
                  <button type="button" onClick={() => setModal('regulamin')}>regulamin serwisu</button>
                  {' '}oraz{' '}
                  <button type="button" onClick={() => setModal('privacy')}>politykę prywatności</button>
                </span>
              </label>

              <button type="submit" className="auth-btn" disabled={!agreed}>
                Utwórz konto
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </form>

            <div className="auth-divider"><span>lub</span></div>
            <p className="auth-footer-text">
              Masz już konto? <Link href="/login">Zaloguj się</Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {modal && (
        <div className="reg-modal-overlay" onClick={() => setModal(null)}>
          <div className="reg-modal" onClick={e => e.stopPropagation()}>
            <div className="reg-modal-head">
              <span className="reg-modal-title">{modal === 'privacy' ? 'Polityka prywatności' : 'Regulamin'}</span>
              <button className="reg-modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="reg-modal-body">
              {modal === 'privacy' ? (
                <>
                  <h3>Administrator danych</h3>
                  <p>Administratorem Twoich danych osobowych jest Motion Drive sp. z o.o. z siedzibą w Warszawie, ul. Przykładowa 1.</p>
                  <h3>Zakres zbieranych danych</h3>
                  <p>Zbieramy dane niezbędne do realizacji usług: imię i nazwisko, adres e-mail, numer telefonu, numer prawa jazdy oraz informacje dotyczące rezerwacji.</p>
                  <h3>Cel przetwarzania</h3>
                  <p>Dane przetwarzane są w celu realizacji umowy najmu pojazdu, obsługi klienta, wystawiania dokumentów rozliczeniowych oraz, za Twoją zgodą, w celach marketingowych.</p>
                  <h3>Prawa użytkownika (RODO)</h3>
                  <p>Masz prawo do dostępu, sprostowania, usunięcia lub ograniczenia przetwarzania swoich danych. Wnioski kieruj na: rodo@motiondrive.pl.</p>
                  <h3>Okres przechowywania</h3>
                  <p>Dane przechowujemy przez czas trwania umowy oraz przez okres wymagany przepisami prawa (do 5 lat od zakończenia umowy).</p>
                </>
              ) : (
                <>
                  <h3>§1 Postanowienia ogólne</h3>
                  <p>Niniejszy regulamin określa zasady wynajmu pojazdów przez Motion Drive. Zawarcie umowy najmu jest równoznaczne z akceptacją regulaminu.</p>
                  <h3>§2 Wymagania najemcy</h3>
                  <p>Warunkiem wynajmu jest ukończone 21 lat, posiadanie ważnego prawa jazdy kategorii B od co najmniej 2 lat oraz ważnego dokumentu tożsamości.</p>
                  <h3>§3 Rezerwacja i płatność</h3>
                  <p>Rezerwacji można dokonać online lub telefonicznie. Wymagana jest zwrotna kaucja określona w cenniku.</p>
                  <h3>§4 Użytkowanie pojazdu</h3>
                  <p>Pojazd można użytkować wyłącznie na terytorium Polski, chyba że umowa stanowi inaczej. Zabronione jest palenie w pojeździe oraz użytkowanie niezgodne z przeznaczeniem.</p>
                  <h3>§5 Odpowiedzialność</h3>
                  <p>Najemca odpowiada za wszelkie szkody wyrządzone w pojeździe podczas trwania najmu.</p>
                  <h3>§6 Reklamacje</h3>
                  <p>Reklamacje należy składać pisemnie w ciągu 14 dni od zakończenia najmu na adres: kontakt@motiondrive.pl.</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}