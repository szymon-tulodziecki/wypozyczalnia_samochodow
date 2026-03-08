export default function CTA() {
  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hp-cta {
          position: relative;
          z-index: 1;
          padding: 3.5rem 2rem;
          text-align: center;
          overflow: hidden;
        }

        .hp-cta::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--blue) 25%, var(--blue-light) 48%, var(--green) 72%, transparent);
        }

        .hp-cta::after {
          content: '';
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 600px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(46,122,181,0.07) 0%, transparent 70%);
          pointer-events: none;
        }

        .hp-cta-title {
          animation: fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s both;
          position: relative;
          z-index: 1;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(1.8rem, 4vw, 3rem);
          letter-spacing: 0.06em;
          background: linear-gradient(110deg, #ffffff 0%, #c8dde8 40%, var(--blue-light) 70%, var(--green) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
        }

        .hp-cta-sub {
          animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.24s both;
          position: relative;
          z-index: 1;
          font-family: 'Barlow', sans-serif;
          font-weight: 300;
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-bottom: 2.5rem;
        }

        .hp-cta-actions {
          animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.38s both;
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        @media (max-width: 540px) {
          .hp-cta { padding: 2.5rem 1.25rem; }
          .hp-cta-actions { flex-direction: column; align-items: center; }
          .hp-btn-primary, .hp-btn-secondary { width: 100%; justify-content: center; }
        }
      `}</style>

      <section className="hp-cta">
        <h2 className="hp-cta-title">Gotowy do drogi?</h2>
        <p className="hp-cta-sub">Zarezerwuj samochód już teraz i wyrusz w trasę bez zbędnych formalności.</p>
        <div className="hp-cta-actions">
          <button className="hp-btn-primary">Zarezerwuj teraz</button>
          <button className="hp-btn-secondary">Zobacz flotę</button>
        </div>
      </section>
    </>
  );
}
