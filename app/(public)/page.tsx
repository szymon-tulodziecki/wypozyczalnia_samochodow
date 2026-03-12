import Hero from '../components/main_page/Hero';
import BrandsBar from '../components/main_page/BrandsBar';
import Features from '../components/main_page/Features';
import CTA from '../components/main_page/CTA';

export default function Home() {
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

        .hp-page {
          background: #08090b;
          overflow: hidden;
        }

        .hp-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(46,122,181,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46,122,181,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }

        .hp-btn-primary {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.55rem 1.6rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.72rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #fff;
          border: none;
          cursor: pointer;
          overflow: hidden;
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          background: linear-gradient(110deg, var(--blue) 0%, var(--green-dark) 100%);
          transition: filter 0.3s, transform 0.25s;
        }

        .hp-btn-primary:hover {
          filter: brightness(1.15);
          transform: translateY(-2px);
        }

        .hp-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.55rem 1.6rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.72rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-dim);
          background: transparent;
          border: 1px solid #1e2830;
          cursor: pointer;
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          transition: color 0.3s, border-color 0.3s, transform 0.25s;
        }

        .hp-btn-secondary:hover {
          color: var(--blue-light);
          border-color: rgba(46,122,181,0.5);
          transform: translateY(-2px);
        }
      `}</style>

      <div className="hp-page">
        <Hero />
        <BrandsBar />
        <Features />
        <CTA />
      </div>
    </>
  );
}
