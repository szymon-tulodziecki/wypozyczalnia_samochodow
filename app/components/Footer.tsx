'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const navLinks = [
  { href: '/', label: 'Strona Główna' },
  { href: '/cars', label: 'Nasza Flota' },
  { href: '/contact', label: 'Kontakt' },
];

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/48000000000',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.121.554 4.11 1.522 5.836L0 24l6.354-1.498A11.956 11.956 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.663-.498-5.193-1.371l-.371-.22-3.844.906.942-3.741-.242-.386A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const [modal, setModal] = useState<string | null>(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:ital,wght@0,300;0,600;1,300&family=Barlow:wght@300;400&display=swap');

        :root {
          --blue:       #2e7ab5;
          --blue-light: #4fa3d4;
          --green:      #6dbf45;
          --green-dark: #4e9930;
          --text-muted: #b8c4d0;
          --text-dim:   #dce8f0;
        }

        /* ── Shell ── */
        .md-footer {
          position: relative;
          background: #08090b;
          overflow: hidden;
        }

        /* Diagonal tinted background shape */
        .md-footer::before {
          content: '';
          position: absolute;
          top: 0; left: -10%; right: 30%;
          height: 3px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--blue) 30%,
            var(--blue-light) 55%,
            var(--green) 80%,
            transparent
          );
        }

        /* Faint grid texture */
        .md-footer::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(46,122,181,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46,122,181,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        /* ── Top accent line (mirrors header) ── */
        .md-footer-topbar {
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

        /* ── Main grid ── */
        .md-footer-inner {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
          padding: 4rem 2rem 2.5rem;
          display: grid;
          grid-template-columns: 1.8fr 1fr 1fr 1.4fr;
          gap: 3rem;
        }

        /* ── Brand column ── */
        .md-footer-brand {}

        .md-footer-logo {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          text-decoration: none;
          margin-bottom: 1.4rem;
        }

        .md-footer-logo-img {
          filter: drop-shadow(0 2px 8px rgba(46,122,181,0.3));
          transition: filter 0.3s, transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }

        .md-footer-logo:hover .md-footer-logo-img {
          filter: drop-shadow(0 4px 16px rgba(109,191,69,0.45));
          transform: scale(1.06) rotate(-2deg);
        }

        .md-footer-logo-sep {
          width: 1px;
          height: 30px;
          background: linear-gradient(
            180deg,
            transparent,
            rgba(46,122,181,0.6) 40%,
            rgba(109,191,69,0.6) 60%,
            transparent
          );
        }

        .md-footer-wordmark { display: flex; flex-direction: column; line-height: 1; }

        .md-footer-wordmark-main {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.55rem;
          letter-spacing: 0.2em;
          background: linear-gradient(100deg, var(--blue-light) 0%, #c8dde8 45%, var(--green) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .md-footer-wordmark-sub {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 300;
          font-style: italic;
          font-size: 0.58rem;
          letter-spacing: 0.42em;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-top: 2px;
        }

        .md-footer-tagline {
          font-family: 'Barlow', sans-serif;
          font-weight: 300;
          font-size: 0.82rem;
          line-height: 1.7;
          color: #9aaabb;
          max-width: 240px;
          margin-bottom: 1.6rem;
        }

        /* Social icons */
        .md-footer-socials {
          display: flex;
          gap: 0.65rem;
        }

        .md-footer-social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px; height: 34px;
          border: 1px solid #1a2230;
          color: var(--text-muted);
          text-decoration: none;
          position: relative;
          overflow: hidden;
          clip-path: polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%);
          transition: color 0.25s, border-color 0.25s;
        }

        .md-footer-social-link::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--blue), var(--green-dark));
          opacity: 0;
          transition: opacity 0.3s;
        }

        .md-footer-social-link:hover {
          color: #fff;
          border-color: transparent;
        }

        .md-footer-social-link:hover::before { opacity: 1; }

        .md-footer-social-link svg { position: relative; z-index: 1; }

        /* ── Column heading ── */
        .md-footer-col h4 {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.68rem;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: var(--blue-light);
          margin-bottom: 1.4rem;
          padding-bottom: 0.6rem;
          border-bottom: 1px solid #0f1820;
          position: relative;
        }

        .md-footer-col h4::after {
          content: '';
          position: absolute;
          bottom: -1px; left: 0;
          width: 28px; height: 1px;
          background: linear-gradient(90deg, var(--blue), var(--green));
        }

        /* Nav links */
        .md-footer-nav {
          list-style: none;
          margin: 0; padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .md-footer-nav li a {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 300;
          font-size: 0.85rem;
          letter-spacing: 0.08em;
          color: #c8d4de;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: color 0.22s, gap 0.22s;
        }

        .md-footer-nav li a::before {
          content: '—';
          font-size: 0.6rem;
          color: var(--green-dark);
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity 0.22s, transform 0.22s;
        }

        .md-footer-nav li a:hover {
          color: #dce8f0;
          gap: 0.65rem;
        }

        .md-footer-nav li a:hover::before {
          opacity: 1;
          transform: translateX(0);
        }

        /* Contact info */
        .md-footer-contact {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }

        .md-footer-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 0.7rem;
        }

        .md-footer-contact-icon {
          flex-shrink: 0;
          width: 28px; height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #0f1820;
          color: var(--blue-light);
        }

        .md-footer-contact-text {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .md-footer-contact-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .md-footer-contact-value {
          font-family: 'Barlow', sans-serif;
          font-weight: 400;
          font-size: 0.82rem;
          color: #9aaabb;
          transition: color 0.2s;
        }

        .md-footer-contact-item:hover .md-footer-contact-value {
          color: var(--text-dim);
        }

        /* ── Bottom bar ── */
        .md-footer-bottom {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
          padding: 1.2rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid #0d1318;
          gap: 1rem;
        }

        .md-footer-copy {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 300;
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          color: #7a8e9e;
        }

        .md-footer-copy strong {
          color: #aabbc8;
          font-weight: 600;
        }

        .md-footer-legal {
          display: flex;
          gap: 1.5rem;
        }

        .md-footer-legal button {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 300;
          font-size: 0.68rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6a8090;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          text-decoration: none;
          transition: color 0.2s;
        }

        .md-footer-legal button:hover { color: var(--text-muted); }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .md-footer-inner {
            grid-template-columns: 1fr 1fr;
            gap: 2rem 1.5rem;
            padding: 2.5rem 1.5rem 1.5rem;
            text-align: center;
          }
          .md-footer-brand { grid-column: 1 / -1; }
          .md-footer-logo { justify-content: center; }
          .md-footer-tagline { margin-left: auto; margin-right: auto; }
          .md-footer-socials { justify-content: center; }
          .md-footer-col h4::after { left: 50%; transform: translateX(-50%); }
          .md-footer-nav { align-items: center; }
          .md-footer-nav li a::before { display: none; }
          .md-footer-contact { align-items: center; }
          .md-footer-contact-item { flex-direction: column; align-items: center; text-align: center; }
          .md-footer-bottom { justify-content: center; text-align: center; }
          .md-footer-legal { justify-content: center; }
        }

        @media (max-width: 540px) {
          .md-footer-inner {
            grid-template-columns: 1fr;
            padding: 2rem 1.25rem 1.25rem;
            gap: 1.5rem;
          }
          .md-footer-tagline { display: none; }
          .md-footer-bottom {
            flex-direction: column;
            align-items: center;
            padding: 0.85rem 1.25rem;
            gap: 0.4rem;
          }
          .md-footer-legal { gap: 1rem; justify-content: center; }
        }

        /* ── Legal Modals ── */
        .md-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(4px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .md-modal {
          background: #0d1117;
          border: 1px solid rgba(79,163,212,0.2);
          border-radius: 12px;
          max-width: 640px;
          width: 100%;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .md-modal::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--blue), var(--green));
        }

        .md-modal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.4rem 1.6rem 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .md-modal-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.5rem;
          letter-spacing: 0.08em;
          color: #fff;
        }

        .md-modal-close {
          background: none;
          border: 1px solid rgba(255,255,255,0.1);
          color: #7a8e9e;
          width: 28px; height: 28px;
          border-radius: 6px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem;
          transition: border-color 0.2s, color 0.2s;
        }

        .md-modal-close:hover {
          border-color: rgba(79,163,212,0.4);
          color: #fff;
        }

        .md-modal-body {
          padding: 1.4rem 1.6rem 1.6rem;
          overflow-y: auto;
          font-family: 'Barlow', sans-serif;
          font-weight: 300;
          font-size: 0.85rem;
          line-height: 1.75;
          color: #b8c4d0;
          flex: 1;
        }

        .md-modal-body h3 {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--blue-light);
          margin: 1.2rem 0 0.4rem;
        }

        .md-modal-body h3:first-child { margin-top: 0; }

        .md-modal-body p { margin-bottom: 0.6rem; }
      `}</style>

      <footer className="md-footer">
        <div className="md-footer-topbar" />

        <div className="md-footer-inner">

          {/* Brand */}
          <div className="md-footer-brand">
            <Link href="/" className="md-footer-logo">
              <Image
                src="/logo.png"
                alt="Motion Drive Logo"
                width={54}
                height={54}
                className="md-footer-logo-img"
              />
              <div className="md-footer-logo-sep" />
              <div className="md-footer-wordmark">
                <span className="md-footer-wordmark-main">Motion Drive</span>
                <span className="md-footer-wordmark-sub">Premium Fleet Rental</span>
              </div>
            </Link>
            <p className="md-footer-tagline">
              Najwyższej klasy wynajem samochodów. Prestiż, komfort i niezawodność na każdej trasie.
            </p>
            <div className="md-footer-socials">
              {socialLinks.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  className="md-footer-social-link"
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nawigacja */}
          <div className="md-footer-col">
            <h4>Nawigacja</h4>
            <ul className="md-footer-nav">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
              <li><Link href="/rezerwacja">Zarezerwuj</Link></li>
            </ul>
          </div>

          {/* Flota */}
          <div className="md-footer-col">
            <h4>Nasza Flota</h4>
            <ul className="md-footer-nav">
              <li><Link href="/cars?typ=sedan">Sedany</Link></li>
              <li><Link href="/cars?typ=suv">SUV-y</Link></li>
              <li><Link href="/cars?typ=van">Vany</Link></li>
              <li><Link href="/cars?typ=premium">Premium</Link></li>
            </ul>
          </div>

          {/* Kontakt */}
          <div className="md-footer-col">
            <h4>Kontakt</h4>
            <div className="md-footer-contact">
              <div className="md-footer-contact-item">
                <div className="md-footer-contact-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.72A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.15a16 16 0 006 6l1.52-1.52a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
                  </svg>
                </div>
                <div className="md-footer-contact-text">
                  <span className="md-footer-contact-label">Telefon</span>
                  <span className="md-footer-contact-value">+48 000 000 000</span>
                </div>
              </div>
              <div className="md-footer-contact-item">
                <div className="md-footer-contact-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div className="md-footer-contact-text">
                  <span className="md-footer-contact-label">Email</span>
                  <span className="md-footer-contact-value">kontakt@motiondrive.pl</span>
                </div>
              </div>
              <div className="md-footer-contact-item">
                <div className="md-footer-contact-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div className="md-footer-contact-text">
                  <span className="md-footer-contact-label">Adres</span>
                  <span className="md-footer-contact-value">ul. Przykładowa 1, Warszawa</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="md-footer-bottom">
          <p className="md-footer-copy">
            © {year} <strong>Motion Drive</strong> — Wszelkie prawa zastrzeżone
          </p>
          <nav className="md-footer-legal">
            <button onClick={() => setModal('privacy')}>Polityka prywatności</button>
            <button onClick={() => setModal('regulamin')}>Regulamin</button>
            <button onClick={() => setModal('cookies')}>Cookies</button>
          </nav>
        </div>
      </footer>

      {modal && (
        <div className="md-modal-overlay" onClick={() => setModal(null)}>
          <div className="md-modal" onClick={(e) => e.stopPropagation()}>
            <div className="md-modal-head">
              <span className="md-modal-title">
                {modal === 'privacy' && 'Polityka prywatności'}
                {modal === 'regulamin' && 'Regulamin'}
                {modal === 'cookies' && 'Cookies'}
              </span>
              <button className="md-modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="md-modal-body">
              {modal === 'privacy' && (
                <>
                  <h3>Administrator danych</h3>
                  <p>Administratorem Twoich danych osobowych jest Motion Drive sp. z o.o. z siedzibą w Warszawie, ul. Przykładowa 1.</p>
                  <h3>Zakres zbieranych danych</h3>
                  <p>Zbieramy dane niezbędne do realizacji usług: imię i nazwisko, adres e-mail, numer telefonu, numer prawa jazdy oraz informacje dotyczące rezerwacji.</p>
                  <h3>Cel przetwarzania</h3>
                  <p>Dane przetwarzane są w celu realizacji umowy najmu pojazdu, obsługi klienta, wystawiania dokumentów rozliczeniowych oraz, za Twoją zgodą, w celach marketingowych.</p>
                  <h3>Prawa użytkownika (RODO)</h3>
                  <p>Masz prawo do dostępu, sprostowania, usunięcia lub ograniczenia przetwarzania swoich danych, a także do wniesienia sprzeciwu lub przeniesienia danych. Wnioski kieruj na: rodo@motiondrive.pl.</p>
                  <h3>Okres przechowywania</h3>
                  <p>Dane przechowujemy przez czas trwania umowy oraz przez okres wymagany przepisami prawa (do 5 lat od zakończenia umowy).</p>
                </>
              )}
              {modal === 'regulamin' && (
                <>
                  <h3>§1 Postanowienia ogólne</h3>
                  <p>Niniejszy regulamin określa zasady wynajmu pojazdów przez Motion Drive. Zawarcie umowy najmu jest równoznaczne z akceptacją regulaminu.</p>
                  <h3>§2 Wymagania najemcy</h3>
                  <p>Warunkiem wynajmu jest ukończone 21 lat, posiadanie ważnego prawa jazdy kategorii B od co najmniej 2 lat oraz ważnego dokumentu tożsamości.</p>
                  <h3>§3 Rezerwacja i płatność</h3>
                  <p>Rezerwacji można dokonać online lub telefonicznie. Wymagana jest zwrotna kaucja określona w cenniku. Płatność akceptowana jest gotówką oraz kartą płatniczą.</p>
                  <h3>§4 Użytkowanie pojazdu</h3>
                  <p>Pojazd można użytkować wyłącznie na terytorium Polski, chyba że umowa stanowi inaczej. Zabronione jest: palenie w pojeździe, przewóz zwierząt bez zabezpieczenia oraz użytkowanie niezgodne z przeznaczeniem.</p>
                  <h3>§5 Odpowiedzialność</h3>
                  <p>Najemca odpowiada za wszelkie szkody wyrządzone w pojeździe podczas trwania najmu. Pojazdy objęte są ubezpieczeniem OC i AC z udziałem własnym najemcy wskazanym w umowie.</p>
                  <h3>§6 Reklamacje</h3>
                  <p>Reklamacje należy składać pisemnie w ciągu 14 dni od zakończenia najmu na adres: kontakt@motiondrive.pl.</p>
                </>
              )}
              {modal === 'cookies' && (
                <>
                  <h3>Czym są pliki Cookies?</h3>
                  <p>Cookies to małe pliki tekstowe zapisywane na Twoim urządzeniu podczas odwiedzania serwisu. Umożliwiają zapamiętanie ustawień i poprawiają komfort korzystania ze strony.</p>
                  <h3>Cookies niezbędne</h3>
                  <p>Konieczne do prawidłowego działania serwisu — sesja użytkownika, ochrona CSRF. Nie można ich wyłączyć bez wpływu na funkcjonalność strony.</p>
                  <h3>Cookies analityczne</h3>
                  <p>Używamy Google Analytics do analizy ruchu na stronie. Dane są anonimizowane i nie identyfikują osobiście użytkowników. Możesz je wyłączyć w ustawieniach przeglądarki.</p>
                  <h3>Cookies marketingowe</h3>
                  <p>Opcjonalne cookies służące do personalizacji treści reklamowych. Aktywowane wyłącznie po wyrażeniu zgody przez użytkownika.</p>
                  <h3>Zarządzanie cookies</h3>
                  <p>Cookies możesz kontrolować i usuwać za pomocą ustawień swojej przeglądarki. Wyłączenie niektórych cookies może ograniczyć funkcjonalność serwisu.</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}