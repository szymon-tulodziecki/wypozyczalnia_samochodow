"use client";

import { useState } from "react";
import Image from "next/image";

const CATEGORIES = ["Wszystkie", "Sedan", "SUV", "Van", "Premium"] as const;
type Category = (typeof CATEGORIES)[number];

const cars = [
  { id: 1, name: "Audi A6",        category: "Sedan",   price: 420, img: "/auto.jpg" },
  { id: 2, name: "BMW 5 Series",   category: "Sedan",   price: 480, img: "/auto.jpg" },
  { id: 3, name: "Mercedes GLE",   category: "SUV",     price: 560, img: "/auto.jpg" },
  { id: 4, name: "Volkswagen Touareg", category: "SUV", price: 490, img: "/auto.jpg" },
  { id: 5, name: "Mercedes V-Class", category: "Van",   price: 520, img: "/auto.jpg" },
  { id: 6, name: "Ford Tourneo",   category: "Van",     price: 360, img: "/auto.jpg" },
  { id: 7, name: "Porsche Panamera", category: "Premium", price: 980, img: "/auto.jpg" },
  { id: 8, name: "Bentley Flying Spur", category: "Premium", price: 1400, img: "/auto.jpg" },
];

const MAX_PRICE = 1500;

export default function Samochody() {
  const [activeCategory, setActiveCategory] = useState<Category>("Wszystkie");
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);

  const filtered = cars.filter(
    (c) =>
      (activeCategory === "Wszystkie" || c.category === activeCategory) &&
      c.price <= maxPrice
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;600&family=Barlow:wght@300;400&display=swap');

        :root {
          --blue:       #2e7ab5;
          --blue-light: #4fa3d4;
          --green:      #6dbf45;
          --green-dark: #4e9930;
        }

        .fl-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #08090b 0%, #0d1117 60%, #08090f 100%);
          padding: 110px 2rem 5rem;
          font-family: 'Barlow', sans-serif;
        }

        /* ── Page header ── */
        .fl-header {
          max-width: 1280px;
          margin: 0 auto 3rem;
        }

        .fl-header-eyebrow {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.65rem;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: var(--green);
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 0.8rem;
        }

        .fl-header-eyebrow::before {
          content: '';
          display: inline-block;
          width: 36px; height: 1px;
          background: linear-gradient(90deg, var(--blue), var(--green));
        }

        .fl-header h1 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.8rem, 6vw, 4.8rem);
          letter-spacing: 0.06em;
          line-height: 0.95;
          background: linear-gradient(110deg, #fff 0%, #c8dde8 45%, var(--blue-light) 75%, var(--green) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
        }

        .fl-header p {
          font-family: 'Barlow', sans-serif;
          font-weight: 300;
          font-size: 0.9rem;
          color: #b8c4d0;
          max-width: 500px;
          line-height: 1.7;
        }

        /* ── Category tabs ── */
        .fl-tabs {
          max-width: 1280px;
          margin: 0 auto 2rem;
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .fl-tab {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.72rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 0.45rem 1.2rem;
          background: transparent;
          border: 1px solid #1a2230;
          color: #b8c4d0;
          cursor: pointer;
          clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
          transition: color 0.22s, border-color 0.22s, background 0.22s;
          position: relative;
          overflow: hidden;
        }

        .fl-tab::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(110deg, var(--blue), var(--green-dark));
          opacity: 0;
          transition: opacity 0.28s;
        }

        .fl-tab span { position: relative; z-index: 1; }

        .fl-tab:hover { border-color: rgba(79,163,212,0.5); color: #dce8f0; }
        .fl-tab:hover::before { opacity: 0.12; }

        .fl-tab.active {
          border-color: rgba(109,191,69,0.6);
          color: #fff;
        }
        .fl-tab.active::before { opacity: 0.3; }

        /* ── Section wrapper (grid + price filter) ── */
        .fl-section {
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
        }

        /* Price filter — top-right corner of section */
        .fl-price-bar {
          position: absolute;
          top: 0; right: 0;
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(79,163,212,0.15);
          border-radius: 8px;
          padding: 0.55rem 1.1rem;
          z-index: 2;
        }

        .fl-price-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.65rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--blue-light);
          white-space: nowrap;
        }

        .fl-price-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 160px;
          height: 3px;
          background: linear-gradient(
            90deg,
            var(--blue) 0%,
            var(--green) calc(${`${((maxPrice / MAX_PRICE) * 100).toFixed(0)}%`}),
            #1a2230 calc(${`${((maxPrice / MAX_PRICE) * 100).toFixed(0)}%`})
          );
          outline: none;
          border-radius: 2px;
          cursor: pointer;
        }

        .fl-price-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px; height: 14px;
          border-radius: 50%;
          background: var(--green);
          box-shadow: 0 0 8px rgba(109,191,69,0.5);
          cursor: pointer;
          border: 2px solid #08090b;
        }

        .fl-price-slider::-moz-range-thumb {
          width: 14px; height: 14px;
          border-radius: 50%;
          background: var(--green);
          box-shadow: 0 0 8px rgba(109,191,69,0.5);
          cursor: pointer;
          border: 2px solid #08090b;
        }

        .fl-price-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1rem;
          letter-spacing: 0.08em;
          color: #dce8f0;
          min-width: 60px;
          text-align: right;
        }

        /* ── Grid ── */
        .fl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          padding-top: 4rem;
        }

        .fl-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(46,122,181,0.12);
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
          cursor: pointer;
        }

        .fl-card:hover {
          border-color: rgba(109,191,69,0.35);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.45), 0 0 20px rgba(109,191,69,0.06);
        }

        .fl-card-img {
          position: relative;
          width: 100%;
          height: 180px;
          overflow: hidden;
          background: #0d1117;
        }

        .fl-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.75;
          transition: opacity 0.3s, transform 0.4s;
        }

        .fl-card:hover .fl-card-img img {
          opacity: 0.9;
          transform: scale(1.04);
        }

        .fl-card-badge {
          position: absolute;
          top: 10px; left: 10px;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.6rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          padding: 0.25rem 0.7rem;
          background: rgba(8,9,11,0.75);
          border: 1px solid rgba(79,163,212,0.3);
          color: var(--blue-light);
          backdrop-filter: blur(6px);
          clip-path: polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%);
        }

        .fl-card-body {
          padding: 1.1rem 1.2rem 1.3rem;
        }

        .fl-card-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.3rem;
          letter-spacing: 0.08em;
          color: #dce8f0;
          margin-bottom: 0.5rem;
        }

        .fl-card-price-row {
          display: flex;
          align-items: baseline;
          gap: 0.3rem;
        }

        .fl-card-price {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.5rem;
          letter-spacing: 0.06em;
          background: linear-gradient(90deg, var(--blue-light), var(--green));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .fl-card-price-unit {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 300;
          font-size: 0.72rem;
          letter-spacing: 0.15em;
          color: #7a8e9e;
        }

        .fl-card-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1rem;
          padding-top: 0.8rem;
          border-top: 1px solid #0f1820;
        }

        .fl-card-cta a, .fl-card-cta button {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.68rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.2s;
        }

        .fl-card-cta .fl-card-link { color: var(--blue-light); }
        .fl-card-cta .fl-card-link:hover { color: var(--green); }

        .fl-card-cta .fl-card-book {
          color: var(--green);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .fl-card-book:hover { color: #9fee6a; }

        .fl-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem 1rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #3d4a56;
        }

        @media (max-width: 768px) {
          .fl-page { padding: 100px 1.25rem 3rem; }
          .fl-price-bar {
            position: static;
            margin-bottom: 1rem;
            width: 100%;
            justify-content: space-between;
          }
          .fl-price-slider { flex: 1; }
          .fl-grid { padding-top: 1rem; }
        }
      `}</style>

      <main className="fl-page">
        {/* Header */}
        <div className="fl-header">
          <p className="fl-header-eyebrow">Motion Drive</p>
          <h1>Nasza Flota</h1>
          <p>Wybierz pojazd dopasowany do swoich potrzeb — od eleganckich sedanów po luksusowe modele premium.</p>
        </div>

        {/* Category tabs */}
        <div className="fl-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`fl-tab${activeCategory === cat ? " active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Section with price filter */}
        <div className="fl-section">
          {/* Price filter — top-right */}
          <div className="fl-price-bar">
            <span className="fl-price-label">Maks. cena</span>
            <input
              type="range"
              className="fl-price-slider"
              min={100}
              max={MAX_PRICE}
              step={10}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{
                background: `linear-gradient(90deg, var(--blue) 0%, var(--green) ${((maxPrice / MAX_PRICE) * 100).toFixed(0)}%, #1a2230 ${((maxPrice / MAX_PRICE) * 100).toFixed(0)}%)`,
              }}
            />
            <span className="fl-price-value">{maxPrice} zł</span>
          </div>

          {/* Grid */}
          <div className="fl-grid">
            {filtered.length === 0 ? (
              <div className="fl-empty">Brak pojazdów spełniających kryteria</div>
            ) : (
              filtered.map((car) => (
                <div key={car.id} className="fl-card">
                  <div className="fl-card-img">
                    <Image src={car.img} alt={car.name} fill style={{ objectFit: "cover" }} />
                    <span className="fl-card-badge">{car.category}</span>
                  </div>
                  <div className="fl-card-body">
                    <div className="fl-card-name">{car.name}</div>
                    <div className="fl-card-price-row">
                      <span className="fl-card-price">{car.price}</span>
                      <span className="fl-card-price-unit">zł / dzień</span>
                    </div>
                    <div className="fl-card-cta">
                      <button className="fl-card-link fl-card-cta">Szczegóły</button>
                      <button className="fl-card-book fl-card-cta">
                        Zarezerwuj →
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}
