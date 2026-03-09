import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <>
      <style>{`
        .hp-hero {
          position: relative;
          z-index: 1;
          height: 100%;
          display: flex;
          align-items: center;
          padding: 5rem 2rem 2rem;
          overflow: hidden;
          background: #08090b;
        }

        /* Subtle grid texture */
        .hp-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(46,122,181,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46,122,181,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        /* Blue ambient glow top-right */
        .hp-hero-glow-blue {
          position: absolute;
          top: -10%; right: 5%;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(46,122,181,0.14) 0%, transparent 65%);
          pointer-events: none;
        }

        /* Green ambient glow bottom-right */
        .hp-hero-glow-green {
          position: absolute;
          bottom: 0; right: 20%;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(109,191,69,0.08) 0%, transparent 65%);
          pointer-events: none;
        }

        /* Bottom separator line */
        .hp-hero::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--blue) 25%,
            var(--blue-light) 48%,
            var(--green) 72%,
            transparent
          );
        }

        /* Two-column layout */
        .hp-hero-inner {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 2rem;
        }

        /* ── Left: text ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeRight {
          from { opacity: 0; transform: translateX(-18px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .hp-hero-content {}

        .hp-hero-eyebrow {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.65rem;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: var(--green);
          margin-bottom: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .hp-hero-eyebrow::before {
          content: '';
          display: inline-block;
          width: 36px; height: 1px;
          background: linear-gradient(90deg, var(--blue), var(--green));
          flex-shrink: 0;
        }

        .hp-hero-title {
          animation: fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.25s both;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.2rem, 5vw, 4.2rem);
          line-height: 0.92;
          letter-spacing: 0.04em;
          margin-bottom: 1rem;
          background: linear-gradient(110deg, #ffffff 0%, #c8dde8 40%, var(--blue-light) 70%, var(--green) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hp-hero-sub {
          animation: fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.42s both;
          font-family: 'Barlow', sans-serif;
          font-weight: 300;
          font-size: 0.88rem;
          line-height: 1.7;
          line-height: 1.8;
          color: #b8c4d0;
          max-width: 440px;
          margin-bottom: 1.6rem;
        }

        /* CTA row */
        .hp-hero-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .hp-btn-primary {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.7rem 1.6rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.78rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #fff;
          background: none;
          border: 1px solid rgba(109,191,69,0.4);
          cursor: pointer;
          overflow: hidden;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          transition: border-color 0.3s, color 0.3s;
        }

        .hp-btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(110deg, var(--blue) 0%, var(--green-dark) 100%);
          opacity: 0.2;
          transition: opacity 0.35s;
        }

        .hp-btn-primary::after {
          content: '';
          position: absolute;
          top: 0; left: -100%; bottom: 0;
          width: 60%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.45s ease;
        }

        .hp-btn-primary:hover { border-color: rgba(109,191,69,0.9); }
        .hp-btn-primary:hover::before { opacity: 0.6; }
        .hp-btn-primary:hover::after  { left: 160%; }
        .hp-btn-primary span { position: relative; z-index: 1; }

        .hp-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.7rem 1.4rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.78rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #b8c4d0;
          background: none;
          border: 1px solid #141c24;
          cursor: pointer;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          transition: color 0.3s, border-color 0.3s;
        }

        .hp-btn-secondary:hover {
          color: var(--text-dim);
          border-color: #2e3d4a;
        }

        /* Small stat row */
        .hp-hero-stats {
          display: flex;
          gap: 2rem;
          margin-top: 1.8rem;
          padding-top: 1.2rem;
          border-top: 1px solid #0d1318;
        }

        .hp-hero-stat {}

        .hp-hero-stat-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.8rem;
          letter-spacing: 0.08em;
          background: linear-gradient(90deg, var(--blue-light), var(--green));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }

        .hp-hero-stat-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 300;
          font-size: 0.6rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-top: 2px;
        }

        /* ── Background car ── */
        .hp-hero-bg-car {
          position: absolute;
          right: -28%;
          bottom: 0;
          width: 85%;
          max-width: 1100px;
          pointer-events: none;
          z-index: 0;
          -webkit-mask-image:
            linear-gradient(to right, transparent 0%, black 20%, black 100%),
            linear-gradient(to top, transparent 0%, black 15%);
          mask-image:
            linear-gradient(to right, transparent 0%, black 20%, black 100%),
            linear-gradient(to top, transparent 0%, black 15%);
          -webkit-mask-composite: intersect;
          mask-composite: intersect;
        }

        @keyframes carSlideIn {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .hp-hero-bg-car-img {
          width: 100%;
          height: auto;
          opacity: 0.22;
          transform: translateZ(0);
          will-change: transform, opacity;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          animation: carSlideIn 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
        }

        /* Blue glow under the bg car */
        .hp-hero-bg-car-glow {
          position: absolute;
          bottom: 0; left: 5%; right: 5%;
          height: 50%;
          background: radial-gradient(ellipse, rgba(46,122,181,0.18) 0%, transparent 70%);
          filter: blur(40px);
          z-index: 0;
          pointer-events: none;
        }

        /* single column — no visual column */
        .hp-hero-inner {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .hp-hero-bg-car { display: none; }
          .hp-hero-eyebrow { justify-content: flex-start; }
        }

        @media (max-width: 540px) {
          .hp-hero { padding: 5.5rem 1.25rem 2rem; min-height: auto; }
          .hp-hero-title { font-size: clamp(2.4rem, 12vw, 3.2rem); }
          .hp-hero-stats { gap: 1.2rem; flex-wrap: wrap; justify-content: center; }
          .hp-hero-stat { flex: 0 1 calc(33% - 0.8rem); text-align: center; }
          .hp-hero-stat-num { font-size: 1.5rem; }
          .hp-hero-actions { flex-direction: column; align-items: flex-start; width: 100%; }
          .hp-btn-primary, .hp-btn-secondary { width: 100%; justify-content: center; }
        }
      `}</style>

      <section className="hp-hero">
        <div className="hp-hero-glow-blue" />
        <div className="hp-hero-glow-green" />

        {/* Background car — positioned absolute behind text */}
        <div className="hp-hero-bg-car">
          <div className="hp-hero-bg-car-glow" />
          <Image
            src="/auto.jpg"
            alt=""
            width={900}
            height={506}
            className="hp-hero-bg-car-img"
            priority
            aria-hidden="true"
          />
        </div>

        <div className="hp-hero-inner">

          {/* Text content */}
          <div className="hp-hero-content">
            <p className="hp-hero-eyebrow">Wypożyczalnia Samochodów</p>
            <h1 className="hp-hero-title">
              Twoja<br />Podróż<br />Zaczyna&nbsp;się&nbsp;Tu
            </h1>
            <p className="hp-hero-sub">
              Szeroka flota pojazdów, konkurencyjne ceny i błyskawiczny proces rezerwacji.
              Wynajmij samochód dopasowany do swoich potrzeb już dziś.
            </p>
            <div className="hp-hero-actions">
              <Link href="/samochody">
              <button className="hp-btn-primary">
                <span>Przeglądaj flotę</span>
              </button>
              </Link>
              
              <Link href="/kontakt">
                <button className="hp-btn-secondary">Skontaktuj się</button>
              </Link>
            </div>

            <div className="hp-hero-stats">
              <div className="hp-hero-stat">
                <div className="hp-hero-stat-num">50+</div>
                <div className="hp-hero-stat-label">Pojazdów w flocie</div>
              </div>
              <div className="hp-hero-stat">
                <div className="hp-hero-stat-num">24/7</div>
                <div className="hp-hero-stat-label">Wsparcie klienta</div>
              </div>
              <div className="hp-hero-stat">
                <div className="hp-hero-stat-num">5★</div>
                <div className="hp-hero-stat-label">Ocena klientów</div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}