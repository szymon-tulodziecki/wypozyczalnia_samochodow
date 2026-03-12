"use client";

import { useState, useEffect } from "react";
import FleetFilters, { type FuelType, type GearboxType, type SeatsOption } from "../../components/fleet/FleetFilters";
import CarCard from "../../components/fleet/CarCard";
import { carsAPI } from "@/lib/api";
import { MAX_PRICE, type Category } from "../../components/fleet/types";
import type { Car } from "../../components/fleet/types";

const PAGE_SIZE = 6;

type ViewMode = "grid" | "list";

export default function Samochody() {
  const [activeCategory, setActiveCategory] = useState<Category>("Wszystkie");
  const [maxPrice, setMaxPrice]             = useState(MAX_PRICE);
  const [fuelType, setFuelType]             = useState<FuelType>("Wszystkie");
  const [gearbox, setGearbox]               = useState<GearboxType>("Wszystkie");
  const [seats, setSeats]                   = useState<SeatsOption>("Wszystkie");
  const [cars, setCars]                     = useState<Car[]>([]);
  const [loading, setLoading]               = useState(true);
  const [viewMode, setViewMode]             = useState<ViewMode>("grid");
  const [visibleCount, setVisibleCount]     = useState(PAGE_SIZE);

  useEffect(() => {
    carsAPI.getAll()      .then(data => {
        const fleet: Car[] = data
          .filter(c => c.status === 'dostepny')
          .map(c => ({
            id: c.id, brand: c.brand, model: c.model, year: c.year,
            category: c.category as Exclude<Category, "Wszystkie">,
            price_per_day: c.price_per_day, images: c.images,
            seats: c.seats, gearbox: c.gearbox, fuel_type: c.fuel_type,
            status: c.status, mileage: c.mileage, color: c.color,
            description: c.description, features: c.features,
            license_plate: c.license_plate,
          }));
        setCars(fleet);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Reset pagination when filters change
  const handleCategoryChange = (v: Category) => { setActiveCategory(v); setVisibleCount(PAGE_SIZE); };
  const handlePriceChange    = (v: number)   => { setMaxPrice(v);       setVisibleCount(PAGE_SIZE); };
  const handleFuelChange     = (v: FuelType) => { setFuelType(v);       setVisibleCount(PAGE_SIZE); };
  const handleGearboxChange  = (v: GearboxType) => { setGearbox(v);    setVisibleCount(PAGE_SIZE); };
  const handleSeatsChange    = (v: SeatsOption) => { setSeats(v);      setVisibleCount(PAGE_SIZE); };

  const handleReset = () => {
    setActiveCategory("Wszystkie");
    setMaxPrice(MAX_PRICE);
    setFuelType("Wszystkie");
    setGearbox("Wszystkie");
    setSeats("Wszystkie");
  };

  const filtered = cars.filter(c => {
    if (activeCategory !== "Wszystkie" && c.category !== activeCategory) return false;
    if (c.price_per_day > maxPrice) return false;
    if (fuelType !== "Wszystkie" && c.fuel_type !== fuelType) return false;
    if (gearbox !== "Wszystkie" && c.gearbox !== gearbox) return false;
    if (seats !== "Wszystkie") {
      const n = c.seats ?? 5;
      if (seats === "7+" && n < 7) return false;
      if (seats !== "7+" && n !== Number(seats)) return false;
    }
    return true;
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600&family=Barlow:wght@300;400&display=swap');

        :root {
          --blue:       #2e7ab5;
          --blue-light: #4fa3d4;
          --green:      #6dbf45;
          --green-dark: #4e9930;
        }

        /* ── Page ── */
        .fl-page {
          position: relative;
          min-height: 100vh;
          background: #0f1318;
          padding: 100px 2rem 5rem;
          font-family: 'Barlow', sans-serif;
        }

        .fl-page::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(46,122,181,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46,122,181,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        /* Accent blobs */
        .fl-blob {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }

        .fl-blob--blue {
          top: 5%; right: 5%;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(46,122,181,0.1) 0%, transparent 65%);
        }

        .fl-blob--green {
          bottom: 10%; left: 0%;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(109,191,69,0.06) 0%, transparent 65%);
        }

        .fl-section {
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* ── Heading ── */
        .fl-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 2.5rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .fl-heading-text {}

        .fl-heading-eyebrow {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600; font-size: 0.62rem;
          letter-spacing: 0.38em; text-transform: uppercase;
          color: var(--green);
          display: flex; align-items: center; gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .fl-heading-eyebrow::before {
          content: '';
          display: block; width: 28px; height: 1px;
          background: linear-gradient(90deg, var(--blue), var(--green));
          flex-shrink: 0;
        }

        .fl-heading-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.2rem, 4vw, 3.4rem);
          letter-spacing: 0.05em; line-height: 0.92;
          color: #e8f0f8;
          margin: 0;
        }

        .fl-heading-title span {
          background: linear-gradient(100deg, #ffffff 0%, var(--blue-light) 55%, var(--green) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* View toggle */
        .fl-view-toggle {
          display: flex;
          gap: 0.3rem;
          align-items: center;
        }

        .fl-view-btn {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(46,122,181,0.15);
          border-radius: 6px;
          cursor: pointer;
          color: #3d5060;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
        }

        .fl-view-btn:hover { color: #7aaccc; border-color: rgba(79,163,212,0.35); }

        .fl-view-btn--active {
          color: #6dbf45;
          border-color: rgba(109,191,69,0.4);
          background: rgba(109,191,69,0.06);
        }

        /* ── Grid / List ── */
        .fl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .fl-list {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        /* List-mode card override */
        .fl-list .fpc-card-link { border-radius: 0; }
        .fl-list .fpc-card-link:first-child .fpc-card { border-radius: 12px 12px 0 0; }
        .fl-list .fpc-card-link:last-child .fpc-card  { border-radius: 0 0 12px 12px; }

        .fl-list .fpc-card {
          flex-direction: row;
          border-radius: 0;
          border-bottom: none;
          border-color: rgba(46,122,181,0.1);
        }

        .fl-list .fpc-img-wrap {
          width: 220px;
          height: 140px;
          flex-shrink: 0;
        }

        .fl-list .fpc-body {
          flex: 1;
          padding: 1rem 1.4rem;
          flex-direction: row;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .fl-list .fpc-header { margin-bottom: 0; flex: 1; min-width: 150px; }
        .fl-list .fpc-specs  { margin-bottom: 0; flex: 1; min-width: 200px; }
        .fl-list .fpc-divider { display: none; }
        .fl-list .fpc-footer { margin-top: 0; }

        /* Skeleton */
        .fl-skeleton {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(46,122,181,0.07);
          border-radius: 16px; height: 360px;
          overflow: hidden; position: relative;
        }

        .fl-skeleton::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%);
          animation: fl-shimmer 1.6s ease-in-out infinite;
        }

        @keyframes fl-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* Empty state */
        .fl-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 5rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .fl-empty-icon {
          font-size: 2rem;
          opacity: 0.2;
        }

        .fl-empty-text {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.78rem; letter-spacing: 0.3em;
          text-transform: uppercase; color: #2a3a4a;
        }

        .fl-empty-reset {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600; font-size: 0.65rem;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: #4fa3d4;
          background: none;
          border: 1px solid rgba(79,163,212,0.25);
          padding: 0.45rem 1.2rem; cursor: pointer;
          clip-path: polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%);
          transition: border-color 0.2s, color 0.2s;
        }

        .fl-empty-reset:hover { border-color: rgba(79,163,212,0.6); color: #7ac4e8; }

        /* ── Show more / pagination ── */
        .fl-load-more {
          margin-top: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
        }

        .fl-load-more-info {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.65rem; font-weight: 300;
          letter-spacing: 0.25em; text-transform: uppercase;
          color: #2a3a4a;
        }

        .fl-load-more-info strong {
          font-weight: 600;
          color: #4a6070;
        }

        .fl-load-more-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.7rem 2rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600; font-size: 0.72rem;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: #dce8f0;
          background: none;
          border: 1px solid rgba(46,122,181,0.3);
          cursor: pointer;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          overflow: hidden;
          transition: border-color 0.3s;
        }

        .fl-load-more-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(110deg, #2e7ab5, #4e9930);
          opacity: 0.1; transition: opacity 0.3s;
        }

        .fl-load-more-btn::after {
          content: ''; position: absolute;
          top: 0; left: -100%; bottom: 0; width: 60%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
          transition: left 0.5s ease;
        }

        .fl-load-more-btn:hover { border-color: rgba(109,191,69,0.5); }
        .fl-load-more-btn:hover::before { opacity: 0.35; }
        .fl-load-more-btn:hover::after { left: 160%; }

        .fl-load-more-btn span { position: relative; z-index: 1; }

        /* Progress bar */
        .fl-progress {
          width: 140px; height: 2px;
          background: rgba(46,122,181,0.12);
          border-radius: 1px;
          overflow: hidden;
        }

        .fl-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--blue), var(--green));
          border-radius: 1px;
          transition: width 0.4s ease;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .fl-page { padding: 90px 1.25rem 3rem; }
          .fl-list .fpc-img-wrap { width: 140px; height: 120px; }
          .fl-list .fpc-body { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <main className="fl-page">
        <div className="fl-blob fl-blob--blue" />
        <div className="fl-blob fl-blob--green" />

        <div className="fl-section">

          {/* Heading + view toggle */}
          <div className="fl-heading">
            <div className="fl-heading-text">
              <p className="fl-heading-eyebrow">Dostępna flota</p>
              <h1 className="fl-heading-title">
                Wybierz <span>Swój Pojazd</span>
              </h1>
            </div>

            <div className="fl-view-toggle">
              <button
                className={`fl-view-btn${viewMode === 'grid' ? ' fl-view-btn--active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Widok siatki"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </button>
              <button
                className={`fl-view-btn${viewMode === 'list' ? ' fl-view-btn--active' : ''}`}
                onClick={() => setViewMode('list')}
                title="Widok listy"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Filters */}
          {!loading && (
            <FleetFilters
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              maxPrice={maxPrice}
              onPriceChange={handlePriceChange}
              maxPriceLimit={MAX_PRICE}
              fuelType={fuelType}
              onFuelChange={handleFuelChange}
              gearbox={gearbox}
              onGearboxChange={handleGearboxChange}
              seats={seats}
              onSeatsChange={handleSeatsChange}
              totalCount={cars.length}
              filteredCount={filtered.length}
              onReset={handleReset}
            />
          )}

          {/* Cars */}
          <div className={viewMode === 'grid' ? 'fl-grid' : 'fl-list'}>
            {loading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="fl-skeleton" />
              ))
            ) : visible.length === 0 ? (
              <div className="fl-empty">
                <span className="fl-empty-icon">◈</span>
                <p className="fl-empty-text">Brak pojazdów spełniających kryteria</p>
                <button className="fl-empty-reset" onClick={handleReset}>Wyczyść filtry</button>
              </div>
            ) : (
              visible.map((car) => (
                <CarCard key={car.id} car={car} />
              ))
            )}
          </div>

          {/* Load more */}
          {!loading && filtered.length > 0 && (
            <div className="fl-load-more">
              <div className="fl-progress">
                <div
                  className="fl-progress-fill"
                  style={{ width: `${Math.min((visibleCount / filtered.length) * 100, 100)}%` }}
                />
              </div>
              <span className="fl-load-more-info">
                <strong>{Math.min(visibleCount, filtered.length)}</strong> z <strong>{filtered.length}</strong>
              </span>
              {hasMore && (
                <button
                  className="fl-load-more-btn"
                  onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                >
                  <span>Pokaż więcej</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12l7 7 7-7"/>
                  </svg>
                </button>
              )}
            </div>
          )}

        </div>
      </main>
    </>
  );
}