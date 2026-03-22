'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';

const publicNavLinks = [
  { href: '/', label: 'Strona Główna' },
  { href: '/cars', label: 'Nasza Flota' },
  { href: '/contact', label: 'Kontakt' },
];

const authNavLinks = [
  { href: '/', label: 'Strona Główna' },
  { href: '/cars', label: 'Nasza Flota' },
  { href: '/contact', label: 'Kontakt' },
  { href: '/account', label: 'Moje Konto' },
];

const adminNavLinks = [
  { href: '/', label: 'Strona Główna' },
  { href: '/cars', label: 'Nasza Flota' },
  { href: '/contact', label: 'Kontakt' },
  { href: '/admin/dashboard', label: 'Dashboard' },
];

export default function Header() {
  const router = useRouter();
  const { isAuthenticated, logout, session } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('/');
  const [mounted, setMounted] = useState(false);
  const isAdmin = session?.role === 'root';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  const navLinks = mounted
    ? isAuthenticated
      ? isAdmin
        ? adminNavLinks
        : authNavLinks
      : publicNavLinks
    : publicNavLinks;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:ital,wght@0,300;0,600;1,300&display=swap');

        :root {
          --blue: #2e7ab5;
          --blue-light: #4fa3d4;
          --green: #6dbf45;
          --green-dark: #4e9930;
          --surface: rgba(14, 18, 24, 0.92);
          --text-muted: #b8c4d0;
          --text-dim: #dce8f0;
        }

        .md-header { position: fixed; top: 0; left: 0; right: 0; z-index: 100; transition: background 0.45s ease, box-shadow 0.45s ease; }
        .md-header.scrolled { background: var(--surface); backdrop-filter: blur(20px) saturate(1.6); -webkit-backdrop-filter: blur(20px) saturate(1.6); box-shadow: 0 1px 0 rgba(46,122,181,0.25), 0 0 0 1px rgba(109,191,69,0.08), 0 12px 40px rgba(0,0,0,0.55); }
        .md-topbar { height: 2px; background: linear-gradient(90deg, transparent 0%, var(--blue) 25%, var(--blue-light) 48%, var(--green) 72%, transparent 100%); }
        .md-nav-inner { max-width: 1280px; margin: 0 auto; padding: 0 2rem; height: 72px; display: flex; align-items: center; justify-content: space-between; }
        .md-logo { display: flex; align-items: center; gap: 0.85rem; text-decoration: none; }
        .md-logo-img { transition: filter 0.3s, transform 0.35s cubic-bezier(0.34,1.56,0.64,1); filter: drop-shadow(0 2px 8px rgba(46,122,181,0.3)); }
        .md-logo:hover .md-logo-img { filter: drop-shadow(0 4px 16px rgba(109,191,69,0.45)); transform: scale(1.06) rotate(-2deg); }
        .md-logo-sep { width:1px; height:30px; background:linear-gradient(180deg, transparent, rgba(46,122,181,0.6) 40%, rgba(109,191,69,0.6) 60%, transparent); }
        .md-wordmark { display:inline-flex; flex-direction:column; line-height:1; }
        .md-wordmark-main { font-family:'Bebas Neue', sans-serif; font-size:1.65rem; letter-spacing:0.2em; background:linear-gradient(100deg,var(--blue-light) 0%,#c8dde8 45%,var(--green) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; transition:filter 0.3s; }
        .md-wordmark-sub { font-family:'Barlow Condensed', sans-serif; font-weight:300; font-style:italic; font-size:0.58rem; letter-spacing:0.42em; color:var(--text-muted); text-transform:uppercase; margin-top:2px; }
        .md-navlist { display:flex; align-items:center; list-style:none; margin:0; padding:0; }
        .md-navlist li a { position:relative; display:block; padding:0.35rem 1.2rem; font-family:'Barlow Condensed',sans-serif; font-weight:600; font-size:0.76rem; letter-spacing:0.22em; text-transform:uppercase; color:#dce8f0; text-decoration:none; transition:color .25s; }
        .md-navlist li a::after { content:''; position:absolute; bottom:0; left:1.2rem; right:1.2rem; height:1px; background:linear-gradient(90deg,var(--blue),var(--green)); transform:scaleX(0); transform-origin:left; transition:transform .32s cubic-bezier(.77,0,.18,1); }
        .md-navlist li a:hover::after, .md-navlist li a.active::after { transform:scaleX(1); }
        .md-navlist li a.active { color:var(--blue-light); }
        .md-navlist li { display:flex; align-items:center; }
        .md-navlist li+li::before { content:''; display:block; width:3px; height:3px; border-radius:50%; background:#1e2830; flex-shrink:0; }
        .md-cta { position:relative; display:inline-flex; align-items:center; margin-left:1.4rem; padding:0.5rem 1.25rem; font-family:'Barlow Condensed',sans-serif; font-weight:600; font-size:0.72rem; letter-spacing:0.2em; text-transform:uppercase; color:#fff; text-decoration:none; overflow:hidden; border:1px solid rgba(109,191,69,0.6); clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%); transition:border-color .3s; background:rgba(8,9,11,0.75); backdrop-filter:blur(8px); }
        .md-cta::before { content:''; position:absolute; inset:0; background:linear-gradient(110deg,var(--blue) 0%,var(--green-dark) 100%); opacity:.35; transition:opacity .35s; }
        .md-cta::after { content:''; position:absolute; top:0; left:-100%; bottom:0; width:60%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent); transition:left .45s ease; }
        .md-cta:hover { border-color:rgba(109,191,69,0.8); }
        .md-cta:hover::before { opacity:.65; }
        .md-cta:hover::after { left:160%; }
        .md-hamburger { display:none; flex-direction:column; gap:5px; background:none; border:none; cursor:pointer; padding:4px; }
        .md-hamburger span { display:block; height:1.5px; background:var(--text-dim); transition:transform .3s,opacity .3s,width .3s; transform-origin:center; }
        .md-hamburger span:nth-child(1){width:24px;} .md-hamburger span:nth-child(2){width:16px;} .md-hamburger span:nth-child(3){width:20px;}
        .md-hamburger.open span:nth-child(1){width:24px;transform:translateY(6.5px) rotate(45deg);} .md-hamburger.open span:nth-child(2){opacity:0;width:0;} .md-hamburger.open span:nth-child(3){width:24px;transform:translateY(-6.5px) rotate(-45deg);}
        .md-mobile-menu { display:none; position:fixed; inset:56px 0 0 0; background:rgba(8,9,11,0.98); backdrop-filter:blur(20px); flex-direction:column; align-items:flex-start; justify-content:flex-start; padding:1.5rem 1.25rem; gap:0; opacity:0; pointer-events:none; transform:translateX(100%); transition: opacity .3s, transform .35s cubic-bezier(.77,0,.18,1); z-index:99; border-top:1px solid #0f1820; }
        .md-mobile-menu.open { opacity:1; transform:translateX(0); pointer-events:all; }
        .md-mobile-menu a { font-family:'Barlow Condensed',sans-serif; font-weight:600; font-size:0.8rem; letter-spacing:0.2em; text-transform:uppercase; color:#c8d4de; text-decoration:none; padding:0.7rem 0; width:100%; border-bottom:1px solid #0d1318; display:flex; align-items:center; gap:0.55rem; }
        .md-mobile-menu a::before { content:''; display:inline-block; width:14px; height:1px; background:linear-gradient(90deg,var(--blue),var(--green)); transition:width .25s; flex-shrink:0; }
        .md-mobile-menu a:hover::before { width:24px; }
        @media (max-width:768px) { .md-navlist,.md-cta{display:none;} .md-hamburger{display:flex;} .md-mobile-menu{display:flex;} .md-nav-inner{height:56px;padding:0 1.1rem;} .md-logo{gap:0.55rem;} .md-logo-img{width:34px!important;height:34px!important;} .md-logo-sep{height:22px;} .md-wordmark-main{font-size:1.15rem;letter-spacing:.15em;} .md-wordmark-sub{font-size:0.48rem;letter-spacing:.3em;} }
      `}</style>

      <header className={`md-header${scrolled ? ' scrolled' : ''}`}>
        <div className="md-topbar" />
        <nav className="md-nav-inner">
          <Link href="/" className="md-logo">
            <Image src="/logo.png" alt="Motion Drive Logo" width={50} height={50} className="md-logo-img" priority />
            <div className="md-logo-sep" />
            <div className="md-wordmark">
              <span className="md-wordmark-main">Motion Drive</span>
              <span className="md-wordmark-sub">Premium Fleet Rental</span>
            </div>
          </Link>

          <ul className="md-navlist">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={activeLink === href ? 'active' : ''} onClick={() => setActiveLink(href)}>
                  {label}
                </Link>
              </li>
            ))}
            <li>
              {!mounted ? (
                <Link href="/login" className="md-cta"><span>Zaloguj się</span></Link>
              ) : isAuthenticated ? (
                <button onClick={() => { logout(); router.push('/'); }} className="md-cta"><span>Wyloguj</span></button>
              ) : (
                <Link href="/login" className="md-cta"><span>Zaloguj się</span></Link>
              )}
            </li>
          </ul>

          <button className={`md-hamburger${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </nav>
      </header>

      <div className={`md-mobile-menu${menuOpen ? ' open' : ''}`}>
        {navLinks.map(({ href, label }) => (
          <Link key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</Link>
        ))}
        {!mounted ? (
          <Link href="/login" className="md-cta" onClick={() => setMenuOpen(false)}><span>Zaloguj się</span></Link>
        ) : isAuthenticated ? (
          <button onClick={() => { logout(); setMenuOpen(false); router.push('/'); }} className="md-cta" style={{ marginTop: '1.2rem', alignSelf: 'flex-start' }}><span>Wyloguj</span></button>
        ) : (
          <Link href="/login" className="md-cta" onClick={() => setMenuOpen(false)}><span>Zaloguj się</span></Link>
        )}
      </div>
    </>
  );
}
