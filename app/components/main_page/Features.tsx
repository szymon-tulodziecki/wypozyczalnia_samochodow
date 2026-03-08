export default function Features() {
  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeRight {
          from { opacity: 0; transform: translateX(-18px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .hp-features {
          position: relative;
          z-index: 1;
          padding: 3.5rem 2rem;
        }

        .hp-features-inner {
          max-width: 1280px;
          margin: 0 auto;
        }

        .hp-section-label {
          animation: fadeRight 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.62rem;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: var(--blue-light);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .hp-section-label::before {
          content: '';
          display: inline-block;
          width: 28px; height: 1px;
          background: var(--blue-light);
        }

        .hp-section-title {
          animation: fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.22s both;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(1.6rem, 3.5vw, 2.6rem);
          letter-spacing: 0.06em;
          color: #dce8f0;
          margin-bottom: 2rem;
        }

        .hp-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5px;
          background: linear-gradient(135deg, rgba(46,122,181,0.15), rgba(109,191,69,0.08));
        }

        .hp-card {
          animation: fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) both;
          background: #0c0f14;
          padding: 1.6rem 1.5rem;
          position: relative;
          overflow: hidden;
          transition: background 0.35s;
        }

        .hp-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--blue), var(--green));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s cubic-bezier(0.77,0,0.18,1);
        }

        .hp-card:nth-child(1) { animation-delay: 0.35s; }
        .hp-card:nth-child(2) { animation-delay: 0.48s; }
        .hp-card:nth-child(3) { animation-delay: 0.61s; }

        .hp-card:hover { background: #10141c; }
        .hp-card:hover::before { transform: scaleX(1); }

        .hp-card-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.2rem;
          line-height: 1;
          letter-spacing: 0.04em;
          background: linear-gradient(135deg, rgba(46,122,181,0.2), rgba(109,191,69,0.12));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.8rem;
        }

        .hp-card-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.82rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #dce8f0;
          margin-bottom: 0.8rem;
        }

        .hp-card-text {
          font-family: 'Barlow', sans-serif;
          font-weight: 300;
          font-size: 0.76rem;
          line-height: 1.75;
          color: var(--text-muted);
        }
      `}</style>

      <section className="hp-features">
        <div className="hp-features-inner">
          <p className="hp-section-label">Dlaczego my</p>
          <h2 className="hp-section-title">Profesjonalizm<br />na każdym etapie</h2>
          <div className="hp-cards">
            <div className="hp-card">
              <div className="hp-card-num">01</div>
              <div className="hp-card-title">Szeroki wybór</div>
              <p className="hp-card-text">
                Od ekonomicznych aut miejskich po przestronne SUV-y i luksusowe pojazdy —
                znajdź samochód idealny dla siebie.
              </p>
            </div>
            <div className="hp-card">
              <div className="hp-card-num">02</div>
              <div className="hp-card-title">Przejrzyste ceny</div>
              <p className="hp-card-text">
                Żadnych ukrytych opłat. Płacisz dokładnie tyle, ile widzisz w ofercie.
                Gwarantujemy konkurencyjne stawki przez cały rok.
              </p>
            </div>
            <div className="hp-card">
              <div className="hp-card-num">03</div>
              <div className="hp-card-title">Szybka rezerwacja</div>
              <p className="hp-card-text">
                Zarezerwuj samochód w kilka minut. Oferujemy podstawienie pod lotnisko
                Chopina i Modlin bez dopłat.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
