'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Car } from './types';

const pln = (n: number) =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(n);

const km = (n: number) =>
  new Intl.NumberFormat('pl-PL').format(n) + ' km';

export default function CarCard({ car }: { car: Car }) {
  const router = useRouter();
  const img = car.images?.[0] || '/auto.jpg';
  const isAvailable = car.status === 'dostepny';

  return (
    <Link href={`/cars/${car.id}`} className="fpc-card-link" tabIndex={-1}>
      <article className="fpc-card">

        {/* Image area */}
        <div className="fpc-img-wrap">
          <Image
            src={img}
            alt={`${car.brand} ${car.model}`}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            style={{ objectFit: 'cover' }}
            className="fpc-img"
          />
          <span className="fpc-cat">{car.category}</span>
          <span className="fpc-year">{car.year}</span>
          {!isAvailable && (
            <div className="fpc-overlay">
              <span className="fpc-overlay-label">
                {car.status === 'wynajety' ? 'Wynajęty' : 'W serwisie'}
              </span>
            </div>
          )}
          <div className="fpc-img-fade" />
        </div>

        {/* Body */}
        <div className="fpc-body">
          <div className="fpc-header">
            <span className="fpc-brand">{car.brand}</span>
            <h3 className="fpc-model">{car.model}</h3>
          </div>

          <div className="fpc-specs">
            <span className="fpc-spec">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              {car.seats ?? 2} os.
            </span>
            <span className="fpc-dot" />
            <span className="fpc-spec">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              {car.gearbox === 'automatyczna' ? 'AT' : 'MT'}
            </span>
            <span className="fpc-dot" />
            <span className="fpc-spec">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 22V8l9-6 9 6v14H3z"/><path d="M9 22V12h6v10"/></svg>
              {car.fuel_type}
            </span>
            {car.mileage != null && (
              <>
                <span className="fpc-dot" />
                <span className="fpc-spec">{km(car.mileage)}</span>
              </>
            )}
          </div>

          <div className="fpc-divider" />

          <div className="fpc-footer">
            <div className="fpc-price-block">
              <span className="fpc-price">{pln(car.price_per_day)}</span>
              <span className="fpc-per">/ dzień</span>
            </div>
            <div className="fpc-actions">
              <span className="fpc-btn-ghost">Szczegóły</span>
              <button
                className={`fpc-btn-primary${!isAvailable ? ' fpc-btn-primary--disabled' : ''}`}
                onClick={e => { e.preventDefault(); if (isAvailable) router.push(`/cars/${car.id}`); }}
                disabled={!isAvailable}
                tabIndex={isAvailable ? 0 : -1}
              >
                {isAvailable ? 'Rezerwuj' : 'Niedostępny'}
              </button>
            </div>
          </div>
        </div>

        <style>{`
          .fpc-card-link {
            display: block;
            text-decoration: none;
            color: inherit;
            border-radius: 16px;
          }

          .fpc-card-link:focus-visible .fpc-card {
            outline: 2px solid rgba(109,191,69,0.6);
            outline-offset: 2px;
          }

          .fpc-card {
            position: relative;
            background: rgba(10, 14, 20, 0.85);
            border: 1px solid rgba(46, 122, 181, 0.15);
            border-radius: 16px;
            overflow: hidden;
            transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
            display: flex;
            flex-direction: column;
            cursor: pointer;
          }

          .fpc-card-link:hover .fpc-card {
            border-color: rgba(109,191,69,0.4);
            transform: translateY(-6px);
            box-shadow: 0 20px 60px rgba(0,0,0,0.55), 0 0 40px rgba(109,191,69,0.04);
          }

          .fpc-img-wrap {
            position: relative;
            width: 100%;
            height: 200px;
            overflow: hidden;
            background: #080c12;
            flex-shrink: 0;
          }

          .fpc-img {
            opacity: 0.7;
            transition: opacity 0.4s, transform 0.5s;
            transform: scale(1.02);
          }

          .fpc-card-link:hover .fpc-img {
            opacity: 0.88;
            transform: scale(1.07);
          }

          .fpc-img-fade {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            height: 70px;
            background: linear-gradient(to top, rgba(10,14,20,0.95), transparent);
            pointer-events: none;
          }

          .fpc-cat {
            position: absolute;
            top: 12px; left: 12px;
            z-index: 2;
            font-family: 'Barlow Condensed', sans-serif;
            font-weight: 600;
            font-size: 0.58rem;
            letter-spacing: 0.28em;
            text-transform: uppercase;
            color: #4fa3d4;
            background: rgba(8,12,18,0.8);
            border: 1px solid rgba(46,122,181,0.35);
            padding: 0.2rem 0.65rem;
            backdrop-filter: blur(8px);
            clip-path: polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%);
          }

          .fpc-year {
            position: absolute;
            top: 12px; right: 12px;
            z-index: 2;
            font-family: 'Bebas Neue', sans-serif;
            font-size: 0.9rem;
            letter-spacing: 0.12em;
            color: rgba(220,232,240,0.45);
            background: rgba(8,12,18,0.7);
            padding: 0.15rem 0.5rem;
            border-radius: 4px;
            backdrop-filter: blur(6px);
          }

          .fpc-overlay {
            position: absolute; inset: 0;
            z-index: 3;
            display: flex; align-items: center; justify-content: center;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(2px);
          }

          .fpc-overlay-label {
            font-family: 'Barlow Condensed', sans-serif;
            font-weight: 600;
            font-size: 0.75rem;
            letter-spacing: 0.3em;
            text-transform: uppercase;
            color: #ff8080;
            border: 1px solid rgba(255,100,100,0.35);
            padding: 0.4rem 1.2rem;
            clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
            background: rgba(180,30,30,0.15);
          }

          .fpc-body {
            padding: 1.2rem 1.35rem 1.35rem;
            display: flex; flex-direction: column;
            gap: 0; flex: 1;
          }

          .fpc-header { margin-bottom: 0.7rem; }

          .fpc-brand {
            display: block;
            font-family: 'Barlow Condensed', sans-serif;
            font-weight: 600;
            font-size: 0.62rem;
            letter-spacing: 0.3em;
            text-transform: uppercase;
            color: #6dbf45;
            margin-bottom: 0.15rem;
          }

          .fpc-model {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 1.55rem;
            letter-spacing: 0.06em;
            color: #dce8f0;
            line-height: 1;
            margin: 0;
          }

          .fpc-specs {
            display: flex; align-items: center;
            gap: 0.5rem; flex-wrap: wrap;
            margin-bottom: 1rem;
          }

          .fpc-spec {
            display: flex; align-items: center; gap: 0.3rem;
            font-family: 'Barlow Condensed', sans-serif;
            font-size: 0.65rem; font-weight: 600;
            letter-spacing: 0.1em; text-transform: uppercase;
            color: #5a7080;
          }

          .fpc-dot { width: 2px; height: 2px; border-radius: 50%; background: #2a3a4a; flex-shrink: 0; }

          .fpc-divider {
            height: 1px;
            background: linear-gradient(90deg, rgba(46,122,181,0.2), rgba(109,191,69,0.1), transparent);
            margin-bottom: 1rem;
          }

          .fpc-footer {
            display: flex; align-items: center;
            justify-content: space-between; gap: 0.75rem; margin-top: auto;
          }

          .fpc-price-block { display: flex; align-items: baseline; gap: 0.3rem; }

          .fpc-price {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 1.6rem; letter-spacing: 0.06em; line-height: 1;
            background: linear-gradient(100deg, #4fa3d4 0%, #6dbf45 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          }

          .fpc-per {
            font-family: 'Barlow Condensed', sans-serif;
            font-size: 0.62rem; font-weight: 300; letter-spacing: 0.2em;
            text-transform: uppercase; color: #3d5060;
          }

          .fpc-actions { display: flex; gap: 0.5rem; align-items: center; }

          .fpc-btn-ghost {
            font-family: 'Barlow Condensed', sans-serif;
            font-weight: 600; font-size: 0.62rem;
            letter-spacing: 0.2em; text-transform: uppercase;
            color: #4a7090; cursor: pointer;
            transition: color 0.2s;
          }

          .fpc-card-link:hover .fpc-btn-ghost { color: #4fa3d4; }

          .fpc-btn-primary {
            font-family: 'Barlow Condensed', sans-serif;
            font-weight: 600; font-size: 0.62rem;
            letter-spacing: 0.2em; text-transform: uppercase;
            color: #fff; background: none;
            border: 1px solid rgba(109,191,69,0.45);
            padding: 0.45rem 1rem; cursor: pointer; text-decoration: none;
            clip-path: polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%);
            position: relative; overflow: hidden;
            transition: border-color 0.25s;
          }

          .fpc-btn-primary::before {
            content: '';
            position: absolute; inset: 0;
            background: linear-gradient(110deg, #2e7ab5, #4e9930);
            opacity: 0.18; transition: opacity 0.3s;
          }

          .fpc-btn-primary:hover { border-color: rgba(109,191,69,0.9); }
          .fpc-btn-primary:hover::before { opacity: 0.5; }

          .fpc-btn-primary--disabled {
            opacity: 0.4; cursor: not-allowed;
            border-color: rgba(255,80,80,0.3); color: #ff8080;
          }
        `}</style>
      </article>
    </Link>
  );
}