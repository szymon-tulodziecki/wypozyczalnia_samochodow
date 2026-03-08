import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <>
      <style>{`
        .hp-hero {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 7rem 2rem 4rem;
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
          margin-bottom: 1.4rem;
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
          font-size: clamp(2.8rem, 6vw, 5.6rem);
          line-height: 0.92;
          letter-spacing: 0.04em;
          margin-bottom: 1.8rem;
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
          line-height: 1.8;
          color: #3d4a56;
          max-width: 440px;
          margin-bottom: 2.8rem;
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
          color: #3d4a56;
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
          margin-top: 3.5rem;
          padding-top: 2rem;
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

        /* ── Right: car image ── */
        .hp-hero-visual {
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
        }

        .hp-hero-car-wrap {
          position: relative;
          width: 100%;
          max-width: 720px;
          transform: translateX(8%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 6%, black 88%, transparent 100%);
          mask-image: linear-gradient(to right, transparent 0%, black 6%, black 88%, transparent 100%);
        }

        /* Blue glow under the car */
        .hp-hero-car-glow {
          position: absolute;
          bottom: 5%;
          left: 10%; right: 10%;
          height: 60%;
          background: radial-gradient(ellipse, rgba(46,122,181,0.15) 0%, transparent 70%);
          filter: blur(28px);
          pointer-events: none;
          z-index: 0;
        }

        /* Slide-in from right on load */
        @keyframes carSlideIn {
          from {
            transform: perspective(900px) rotateY(-6deg) translateX(120px);
            opacity: 0;
          }
          to {
            transform: perspective(900px) rotateY(-4deg) translateX(0);
            opacity: 1;
          }
        }

        .hp-hero-car-img {
          position: relative;
          z-index: 1;
          width: 100%;
          height: auto;
          filter:
            drop-shadow(0 30px 50px rgba(0,0,0,0.85))
            drop-shadow(0 8px 24px rgba(0,0,0,0.7))
            drop-shadow(0 2px 8px rgba(46,122,181,0.15));
          transform: perspective(900px) rotateY(-4deg);
          animation: carSlideIn 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
          image-rendering: -webkit-optimize-contrast;
        }

        /* Decorative vertical line left of car */
        .hp-hero-car-line {
          position: absolute;
          left: -1.5rem;
          top: 15%; bottom: 15%;
          width: 1px;
          background: linear-gradient(
            180deg,
            transparent,
            rgba(46,122,181,0.4) 30%,
            rgba(109,191,69,0.4) 70%,
            transparent
          );
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .hp-hero-inner {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .hp-hero-eyebrow { justify-content: center; }
          .hp-hero-sub     { margin-left: auto; margin-right: auto; }
          .hp-hero-actions { justify-content: center; }
          .hp-hero-stats   { justify-content: center; }
          .hp-hero-visual  { justify-content: center; margin-top: 2rem; }
          .hp-hero-car-line { display: none; }
        }

        @media (max-width: 540px) {
          .hp-hero { padding: 6rem 1.25rem 3rem; }
          .hp-hero-stats { gap: 1.5rem; }
        }
      `}</style>

      <section className="hp-hero">
        <div className="hp-hero-glow-blue" />
        <div className="hp-hero-glow-green" />

        <div className="hp-hero-inner">

          {/* Left — text */}
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
              <button className="hp-btn-primary">
                <span>Przeglądaj flotę</span>
              </button>
              <button className="hp-btn-secondary">Skontaktuj się</button>
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

          {/* Right — car */}
          <div className="hp-hero-visual">
            <div className="hp-hero-car-wrap">
              <div className="hp-hero-car-glow" />
              <div className="hp-hero-car-line" />
              <Image
                src="/car.png"
                alt="Samochód premium do wynajęcia"
                width={640}
                height={360}
                className="hp-hero-car-img"
                priority
              />
            </div>
          </div>

        </div>
      </section>
    </>
  );
}