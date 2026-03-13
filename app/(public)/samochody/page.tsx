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
    carsAPI.getAll()
      .then(data => {
        const fleet: Car[] = data
          .filter(c => c.status === "dostepny")
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

  const reset = () => {
    setActiveCategory("Wszystkie"); setMaxPrice(MAX_PRICE);
    setFuelType("Wszystkie"); setGearbox("Wszystkie"); setSeats("Wszystkie");
  };

  const handleCategoryChange = (v: Category)    => { setActiveCategory(v); setVisibleCount(PAGE_SIZE); };
  const handlePriceChange    = (v: number)       => { setMaxPrice(v);       setVisibleCount(PAGE_SIZE); };
  const handleFuelChange     = (v: FuelType)     => { setFuelType(v);       setVisibleCount(PAGE_SIZE); };
  const handleGearboxChange  = (v: GearboxType)  => { setGearbox(v);        setVisibleCount(PAGE_SIZE); };
  const handleSeatsChange    = (v: SeatsOption)  => { setSeats(v);          setVisibleCount(PAGE_SIZE); };
  const handleReset          = ()                => { reset();              setVisibleCount(PAGE_SIZE); };

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
  const progressPct = filtered.length > 0
    ? Math.min((visibleCount / filtered.length) * 100, 100)
    : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600&family=Barlow:wght@300;400&display=swap');

        :root {
          --blue:        #2e7ab5;
          --blue-light:  #4fa3d4;
          --green:       #6dbf45;
          --green-dark:  #4e9930;
          --bg:          #0f1318;
          --surface:     #070b10;
          --text-dim:    #4a5e6d;
          --text-mid:    #7c9aac;
          --text-bright: #dce8f0;
        }

        /* ── Page ── */
        .fl-page {
          position: relative;
          min-height: 100vh;
          background: var(--bg);
          /* mobile-first padding: small top (for fixed nav), bigger on desktop */
          padding: 80px 1rem 4rem;
          font-family: 'Barlow', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .fl-page::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(46,122,181,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46,122,181,0.035) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        /* Blobs — toned down on mobile to avoid clutter */
        .fl-blob {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .fl-blob--blue  {
          top: -60px; right: -60px;
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(46,122,181,0.12) 0%, transparent 65%);
        }
        .fl-blob--green {
          bottom: 5%; left: -80px;
          width: 260px; height: 260px;
          background: radial-gradient(circle, rgba(109,191,69,0.07) 0%, transparent 65%);
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
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.75rem;
          gap: 0.75rem;
        }

        .fl-heading-eyebrow {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600; font-size: 0.58rem;
          letter-spacing: 0.36em; text-transform: uppercase;
          color: var(--green);
          display: flex; align-items: center; gap: 0.6rem;
          margin-bottom: 0.4rem;
        }
        .fl-heading-eyebrow::before {
          content: '';
          display: block; width: 22px; height: 1px;
          background: linear-gradient(90deg, var(--blue), var(--green));
          flex-shrink: 0;
        }

        .fl-heading-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(1.9rem, 7vw, 3.4rem);
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

        /* ── View toggle ── */
        .fl-view-toggle {
          display: flex;
          gap: 0.25rem;
          align-items: center;
          flex-shrink: 0;
        }
        .fl-view-btn {
          display: flex; align-items: center; justify-content: center;
          /* slightly smaller tap target on mobile */
          width: 34px; height: 34px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(46,122,181,0.14);
          border-radius: 7px;
          cursor: pointer;
          color: #3d5060;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .fl-view-btn:hover       { color: #7aaccc; border-color: rgba(79,163,212,0.3); }
        .fl-view-btn--active     { color: var(--green); border-color: rgba(109,191,69,0.38); background: rgba(109,191,69,0.06); }

        /* ── Skeleton ── */
        .fl-skeleton {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(46,122,181,0.07);
          border-radius: 14px;
          height: 340px;
          overflow: hidden; position: relative;
        }
        .fl-skeleton::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.035) 50%, transparent 100%);
          animation: fl-shimmer 1.7s ease-in-out infinite;
        }
        @keyframes fl-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%);  }
        }

        /* ── Grid ── */
        .fl-grid {
          display: grid;
          /* on mobile: single column; tablet: 2; desktop: 3 */
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        /* ── List ── */
        .fl-list {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        /* List card overrides — stacked on mobile, horizontal on ≥640 */
        .fl-list .fpc-card {
          border-radius: 0;
          border-color: rgba(46,122,181,0.09);
          border-bottom: none;
        }
        .fl-list .fpc-card-link:first-child .fpc-card { border-radius: 12px 12px 0 0; }
        .fl-list .fpc-card-link:last-child  .fpc-card  { border-radius: 0 0 12px 12px; }
        .fl-list .fpc-divider { display: none; }

        /* ── Empty state ── */
        .fl-empty {
          grid-column: 1 / -1;
          display: flex; flex-direction: column; align-items: center;
          gap: 1rem;
          padding: 4rem 1rem;
          text-align: center;
        }
        .fl-empty-icon  {
          font-size: 1.8rem; opacity: 0.18;
          line-height: 1;
        }
        .fl-empty-text  {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem; letter-spacing: 0.3em;
          text-transform: uppercase; color: #253444;
        }
        .fl-empty-reset {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600; font-size: 0.62rem;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--blue-light);
          background: none;
          border: 1px solid rgba(79,163,212,0.22);
          padding: 0.5rem 1.4rem; cursor: pointer;
          clip-path: polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%);
          transition: border-color 0.2s, color 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .fl-empty-reset:hover { border-color: rgba(79,163,212,0.55); color: #7ac4e8; }

        /* ── Load more ── */
        .fl-load-more {
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .fl-progress {
          width: 100%;
          max-width: 280px;
          height: 2px;
          background: rgba(46,122,181,0.1);
          border-radius: 1px;
          overflow: hidden;
        }
        .fl-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--blue), var(--green));
          border-radius: 1px;
          transition: width 0.45s ease;
        }
        .fl-load-more-info {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.62rem; font-weight: 300;
          letter-spacing: 0.28em; text-transform: uppercase;
          color: #253444;
        }
        .fl-load-more-info strong { font-weight: 600; color: #3d5565; }

        .fl-load-more-btn {
          position: relative;
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.75rem 2.2rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600; font-size: 0.7rem;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--text-bright);
          background: none;
          border: 1px solid rgba(46,122,181,0.28);
          cursor: pointer;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          overflow: hidden;
          transition: border-color 0.3s;
          -webkit-tap-highlight-color: transparent;
          /* easier tap on mobile */
          min-width: 180px;
          justify-content: center;
        }
        .fl-load-more-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(110deg, #2e7ab5, #4e9930);
          opacity: 0.08; transition: opacity 0.3s;
        }
        .fl-load-more-btn::after {
          content: ''; position: absolute;
          top: 0; left: -100%; bottom: 0; width: 60%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
          transition: left 0.5s ease;
        }
        .fl-load-more-btn:hover               { border-color: rgba(109,191,69,0.45); }
        .fl-load-more-btn:hover::before        { opacity: 0.3; }
        .fl-load-more-btn:hover::after         { left: 160%; }
        .fl-load-more-btn:active::before       { opacity: 0.45; }
        .fl-load-more-btn span                 { position: relative; z-index: 1; }
        .fl-load-more-btn svg                  { position: relative; z-index: 1; flex-shrink: 0; }

        /* ── Tablet ≥ 640px ── */
        @media (min-width: 640px) {
          .fl-page          { padding: 90px 1.5rem 4rem; }
          .fl-blob--blue    { top: 0; right: 0; width: 380px; height: 380px; }
          .fl-blob--green   { width: 340px; height: 340px; }
          .fl-grid          { grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
          .fl-skeleton      { height: 360px; }

          /* List: horizontal layout from 640 */
          .fl-list .fpc-card {
            flex-direction: row;
          }
          .fl-list .fpc-img-wrap {
            width: 200px; height: 140px;
            flex-shrink: 0;
          }
          .fl-list .fpc-body {
            flex: 1; padding: 1rem 1.4rem;
            flex-direction: row; align-items: center;
            flex-wrap: wrap; gap: 0.5rem;
          }
          .fl-list .fpc-header { margin-bottom: 0; flex: 1; min-width: 140px; }
          .fl-list .fpc-specs  { margin-bottom: 0; flex: 1; min-width: 180px; }
          .fl-list .fpc-footer { margin-top: 0; }

          .fl-load-more { flex-direction: row; flex-wrap: wrap; justify-content: center; }
        }

        /* ── Desktop ≥ 1024px ── */
        @media (min-width: 1024px) {
          .fl-page          { padding: 100px 2rem 5rem; }
          .fl-blob--blue    { top: 5%; right: 5%; width: 500px; height: 500px; }
          .fl-blob--green   { bottom: 10%; width: 420px; height: 420px; }
          .fl-grid          { grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
          .fl-list .fpc-img-wrap { width: 240px; height: 155px; }
          .fl-heading       { margin-bottom: 2.5rem; }
        }
      `}</style>

      <main className="fl-page">
        <div className="fl-blob fl-blob--blue" />
        <div className="fl-blob fl-blob--green" />

        <div className="fl-section">

          {/* Heading + view toggle */}
          <div className="fl-heading">
            <div>
              <p className="fl-heading-eyebrow">Dostępna flota</p>
              <h1 className="fl-heading-title">
                Wybierz <span>Swój Pojazd</span>
              </h1>
            </div>

            <div className="fl-view-toggle">
              <button
                className={`fl-view-btn${viewMode === "grid" ? " fl-view-btn--active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Widok siatki"
                aria-pressed={viewMode === "grid"}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                </svg>
              </button>
              <button
                className={`fl-view-btn${viewMode === "list" ? " fl-view-btn--active" : ""}`}
                onClick={() => setViewMode("list")}
                title="Widok listy"
                aria-pressed={viewMode === "list"}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
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
          <div className={viewMode === "grid" ? "fl-grid" : "fl-list"}>
            {loading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="fl-skeleton" />
              ))
            ) : visible.length === 0 ? (
              <div className="fl-empty">
                <span className="fl-empty-icon">◈</span>
                <p className="fl-empty-text">Brak pojazdów spełniających kryteria</p>
                <button className="fl-empty-reset" onClick={handleReset}>
                  Wyczyść filtry
                </button>
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
                <div className="fl-progress-fill" style={{ width: `${progressPct}%` }} />
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
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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