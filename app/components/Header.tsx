'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/', label: 'Strona Główna' },
  { href: '/samochody', label: 'Nasza Flota' },
  { href: '/kontakt', label: 'Kontakt' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('/');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:ital,wght@0,300;0,600;1,300&display=swap');

        :root {
          --blue:       #2e7ab5;
          --blue-light: #4fa3d4;
          --green:      #6dbf45;
          --green-dark: #4e9930;
          --surface:    rgba(14, 18, 24, 0.92);
          --text-muted: #5a6270;
          --text-dim:   #9aa3ae;
        }

        .md-header {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          transition: background 0.45s ease, box-shadow 0.45s ease;
        }

        .md-header.scrolled {
          background: var(--surface);
          backdrop-filter: blur(20px) saturate(1.6);
          -webkit-backdrop-filter: blur(20px) saturate(1.6);
          box-shadow:
            0 1px 0 rgba(46, 122, 181, 0.25),
            0 0 0 1px rgba(109, 191, 69, 0.08),
            0 12px 40px rgba(0,0,0,0.55);
        }

        .md-topbar {
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

        .md-nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 2rem;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .md-logo {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          text-decoration: none;
        }

        .md-logo-img {
          transition: filter 0.3s, transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
          filter: drop-shadow(0 2px 8px rgba(46,122,181,0.3));
        }

        .md-logo:hover .md-logo-img {
          filter: drop-shadow(0 4px 16px rgba(109,191,69,0.45));
          transform: scale(1.06) rotate(-2deg);
        }

        .md-logo-sep {
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

        .md-wordmark { display: flex; flex-direction: column; line-height: 1; }

        .md-wordmark-main {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.65rem;
          letter-spacing: 0.2em;
          background: linear-gradient(100deg, var(--blue-light) 0%, #c8dde8 45%, var(--green) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: filter 0.3s;
        }

        .md-logo:hover .md-wordmark-main { filter: brightness(1.2); }

        .md-wordmark-sub {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 300;
          font-style: italic;
          font-size: 0.58rem;
          letter-spacing: 0.42em;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-top: 2px;
        }

        .md-navlist {
          display: flex;
          align-items: center;
          list-style: none;
          margin: 0; padding: 0;
        }

        .md-navlist li a {
          position: relative;
          display: block;
          padding: 0.35rem 1.2rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.76rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-dim);
          text-decoration: none;
          transition: color 0.25s;
        }

        .md-navlist li a::after {
          content: '';
          position: absolute;
          bottom: 0; left: 1.2rem; right: 1.2rem;
          height: 1px;
          background: linear-gradient(90deg, var(--blue), var(--green));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.32s cubic-bezier(0.77,0,0.18,1);
        }

        .md-navlist li a:hover        { color: #dce8f0; }
        .md-navlist li a:hover::after,
        .md-navlist li a.active::after { transform: scaleX(1); }
        .md-navlist li a.active       { color: var(--blue-light); }

        .md-navlist li {
          display: flex;
          align-items: center;
        }

        .md-navlist li + li::before {
          content: '';
          display: block;
          width: 3px; height: 3px;
          border-radius: 50%;
          background: #1e2830;
          flex-shrink: 0;
        }

        .md-cta {
          position: relative;
          display: inline-flex;
          align-items: center;
          margin-left: 1.4rem;
          padding: 0.5rem 1.25rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.72rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #fff;
          text-decoration: none;
          overflow: hidden;
          border: 1px solid rgba(109,191,69,0.35);
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          transition: border-color 0.3s;
        }

        .md-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(110deg, var(--blue) 0%, var(--green-dark) 100%);
          opacity: 0.18;
          transition: opacity 0.35s;
        }

        .md-cta::after {
          content: '';
          position: absolute;
          top: 0; left: -100%; bottom: 0;
          width: 60%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          transition: left 0.45s ease;
        }

        .md-cta:hover { border-color: rgba(109,191,69,0.8); }
        .md-cta:hover::before { opacity: 0.65; }
        .md-cta:hover::after  { left: 160%; }
        .md-cta span { position: relative; z-index: 1; }

        .md-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }

        .md-hamburger span {
          display: block;
          height: 1.5px;
          background: var(--text-dim);
          transition: transform 0.3s, opacity 0.3s, width 0.3s;
          transform-origin: center;
        }

        .md-hamburger span:nth-child(1) { width: 24px; }
        .md-hamburger span:nth-child(2) { width: 16px; }
        .md-hamburger span:nth-child(3) { width: 20px; }

        .md-hamburger.open span:nth-child(1) { width: 24px; transform: translateY(6.5px) rotate(45deg); }
        .md-hamburger.open span:nth-child(2) { opacity: 0; width: 0; }
        .md-hamburger.open span:nth-child(3) { width: 24px; transform: translateY(-6.5px) rotate(-45deg); }

        .md-mobile-menu {
          display: none;
          position: fixed;
          inset: 74px 0 0 0;
          background: rgba(8, 9, 11, 0.97);
          backdrop-filter: blur(16px);
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2.8rem;
          opacity: 0;
          pointer-events: none;
          transform: translateY(-12px);
          transition: opacity 0.3s, transform 0.3s;
          z-index: 99;
        }

        .md-mobile-menu.open {
          opacity: 1;
          transform: translateY(0);
          pointer-events: all;
        }

        .md-mobile-menu a {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.6rem;
          letter-spacing: 0.1em;
          color: #9aa3ae;
          text-decoration: none;
          transition: color 0.2s;
        }

        .md-mobile-menu a:hover {
          background: linear-gradient(90deg, var(--blue-light), var(--green));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @media (max-width: 768px) {
          .md-navlist, .md-cta { display: none; }
          .md-hamburger { display: flex; }
          .md-mobile-menu { display: flex; }
          .md-nav-inner { height: 64px; }
        }
      `}</style>

      <header className={`md-header${scrolled ? ' scrolled' : ''}`}>
        <div className="md-topbar" />
        <nav className="md-nav-inner">

          <Link href="/" className="md-logo">
            <Image
              src="/logo.png"
              alt="Motion Drive Logo"
              width={50}
              height={50}
              className="md-logo-img"
              priority
            />
            <div className="md-logo-sep" />
            <div className="md-wordmark">
              <span className="md-wordmark-main">Motion Drive</span>
              <span className="md-wordmark-sub">Premium Fleet Rental</span>
            </div>
          </Link>

          <ul className="md-navlist">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={activeLink === href ? 'active' : ''}
                  onClick={() => setActiveLink(href)}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/rezerwacja" className="md-cta">
                <span>Zarezerwuj</span>
              </Link>
            </li>
          </ul>

          <button
            className={`md-hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </nav>
      </header>

      <div className={`md-mobile-menu${menuOpen ? ' open' : ''}`}>
        {navLinks.map(({ href, label }) => (
          <Link key={href} href={href} onClick={() => setMenuOpen(false)}>
            {label}
          </Link>
        ))}
        <Link href="/rezerwacja" className="md-cta" onClick={() => setMenuOpen(false)}>
          <span>Zarezerwuj</span>
        </Link>
      </div>
    </>
  );
}