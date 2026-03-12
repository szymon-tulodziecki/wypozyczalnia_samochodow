'use client';
import Image from 'next/image';

const BASE = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized';

const BRANDS = [
  { name: 'BMW',          slug: 'bmw' },
  { name: 'Mercedes-Benz',slug: 'mercedes-benz' },
  { name: 'Audi',         slug: 'audi' },
  { name: 'Volkswagen',   slug: 'volkswagen' },
  { name: 'Ferrari',      slug: 'ferrari' },
  { name: 'Lamborghini',  slug: 'lamborghini' },
  { name: 'Bentley',      slug: 'bentley' },
  { name: 'Tesla',        slug: 'tesla' },
  { name: 'Maserati',     slug: 'maserati' },
  { name: 'Land Rover',   slug: 'land-rover' },
  { name: 'Rolls-Royce',  slug: 'rolls-royce' },
].map(b => ({ ...b, logo: `${BASE}/${b.slug}.png` }));

export default function BrandsBar() {
  const doubled = [...BRANDS, ...BRANDS];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300&display=swap');

        .brands-bar {
          position: relative;
          background: #08090b;
          border-top: 1px solid rgba(46,122,181,0.1);
          border-bottom: 1px solid rgba(46,122,181,0.1);
          overflow: hidden;
          height: 90px;
        }

        .brands-bar::before,
        .brands-bar::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 120px;
          z-index: 2;
          pointer-events: none;
        }
        .brands-bar::before {
          left: 0;
          background: linear-gradient(to right, #08090b 30%, transparent);
        }
        .brands-bar::after {
          right: 0;
          background: linear-gradient(to left, #08090b 30%, transparent);
        }

        .brands-track {
          display: flex;
          align-items: center;
          height: 100%;
          animation: brands-scroll 36s linear infinite;
          width: max-content;
        }

        .brands-bar:hover .brands-track {
          animation-play-state: paused;
        }

        @keyframes brands-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .brands-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          gap: 2px;
          padding: 8px 2.8rem 0;
          height: 100%;
          flex-shrink: 0;
          opacity: 0.85;
          transition: opacity 0.3s;
          cursor: default;
        }

        .brands-item:hover { opacity: 0.9; }

        .brands-item img {
          height: 36px;
          width: auto;
          max-width: 90px;
          object-fit: contain;
          display: block;
        }

        .brands-item.white-logo img {
          filter: brightness(0) invert(1);
        }

        .brands-item span {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 300;
          font-size: 0.5rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #4a5e6e;
          white-space: nowrap;
        }

        .brands-sep {
          width: 1px;
          height: 22px;
          background: rgba(46,122,181,0.1);
          flex-shrink: 0;
        }
      `}</style>

      <div className="brands-bar" aria-label="Dostępne marki">
        <div className="brands-track">
          {doubled.map((brand, i) => (
            <div key={`${brand.slug}-${i}`} style={{ display: 'flex', alignItems: 'center' }}>
              <div className={`brands-item ${['Audi', 'Maserati'].includes(brand.name) ? 'white-logo' : ''}`}>
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={90}
                  height={36}
                  style={{ objectFit: 'contain', height: '36px', width: 'auto' }}
                  unoptimized
                />
              </div>
              <div className="brands-sep" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}