'use client';
import type { Category } from './types';
import { CATEGORIES } from './types';

export const FUEL_TYPES = ['Wszystkie', 'benzyna', 'diesel', 'elektryczny', 'hybryda', 'LPG'] as const;
export type FuelType = (typeof FUEL_TYPES)[number];

export const GEARBOX_TYPES = ['Wszystkie', 'automatyczna', 'manualna'] as const;
export type GearboxType = (typeof GEARBOX_TYPES)[number];

export const SEATS_OPTIONS = ['Wszystkie', '2', '4', '5', '7+'] as const;
export type SeatsOption = (typeof SEATS_OPTIONS)[number];

interface FleetFiltersProps {
  activeCategory: Category;
  onCategoryChange: (cat: Category) => void;
  maxPrice: number;
  onPriceChange: (price: number) => void;
  maxPriceLimit: number;
  fuelType: FuelType;
  onFuelChange: (f: FuelType) => void;
  gearbox: GearboxType;
  onGearboxChange: (g: GearboxType) => void;
  seats: SeatsOption;
  onSeatsChange: (s: SeatsOption) => void;
  totalCount: number;
  filteredCount: number;
  onReset: () => void;
}

const pln = (n: number) =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(n);

const CATEGORY_ICONS: Record<string, string> = {
  'Wszystkie': '◈', 'ekonomiczny': '◇', 'komfort': '◆',
  'premium': '✦', 'SUV': '⬡', 'van': '⬢',
};

export default function FleetFilters({
  activeCategory, onCategoryChange,
  maxPrice, onPriceChange, maxPriceLimit,
  fuelType, onFuelChange,
  gearbox, onGearboxChange,
  seats, onSeatsChange,
  totalCount, filteredCount,
  onReset,
}: FleetFiltersProps) {
  const pct = (maxPrice / maxPriceLimit) * 100;
  const hasActiveFilters =
    activeCategory !== 'Wszystkie' ||
    fuelType !== 'Wszystkie' ||
    gearbox !== 'Wszystkie' ||
    seats !== 'Wszystkie' ||
    maxPrice < maxPriceLimit;

  return (
    <div className="fpf-root">

      {/* ── Row 1: categories + counter ── */}
      <div className="fpf-row fpf-row--top">
        <div className="fpf-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`fpf-tab${activeCategory === cat ? ' fpf-tab--active' : ''}`}
              onClick={() => onCategoryChange(cat)}
            >
              <span className="fpf-tab-icon">{CATEGORY_ICONS[cat] ?? '◇'}</span>
              <span className="fpf-tab-label">
                {cat === 'Wszystkie' ? 'Wszystkie' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </span>
            </button>
          ))}
        </div>

        <div className="fpf-meta">
          <div className="fpf-count">
            <span className="fpf-count-num">{filteredCount}</span>
            <span className="fpf-count-of">/{totalCount}</span>
            <span className="fpf-count-label">pojazdów</span>
          </div>
          {hasActiveFilters && (
            <button className="fpf-reset" onClick={onReset}>
              ✕ Wyczyść filtry
            </button>
          )}
        </div>
      </div>

      {/* ── Row 2: secondary filters ── */}
      <div className="fpf-row fpf-row--filters">

        {/* Fuel type */}
        <div className="fpf-filter-group">
          <span className="fpf-filter-label">Paliwo</span>
          <div className="fpf-pills">
            {FUEL_TYPES.map(f => (
              <button
                key={f}
                className={`fpf-pill${fuelType === f ? ' fpf-pill--active' : ''}`}
                onClick={() => onFuelChange(f)}
              >
                {f === 'Wszystkie' ? 'Każde' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Gearbox */}
        <div className="fpf-filter-group">
          <span className="fpf-filter-label">Skrzynia</span>
          <div className="fpf-pills">
            {GEARBOX_TYPES.map(g => (
              <button
                key={g}
                className={`fpf-pill${gearbox === g ? ' fpf-pill--active' : ''}`}
                onClick={() => onGearboxChange(g)}
              >
                {g === 'Wszystkie' ? 'Każda' : g === 'automatyczna' ? 'Automat' : 'Manualna'}
              </button>
            ))}
          </div>
        </div>

        {/* Seats */}
        <div className="fpf-filter-group">
          <span className="fpf-filter-label">Miejsca</span>
          <div className="fpf-pills">
            {SEATS_OPTIONS.map(s => (
              <button
                key={s}
                className={`fpf-pill${seats === s ? ' fpf-pill--active' : ''}`}
                onClick={() => onSeatsChange(s)}
              >
                {s === 'Wszystkie' ? 'Wszystkie' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Price slider */}
        <div className="fpf-filter-group fpf-filter-group--price">
          <div className="fpf-price-header">
            <span className="fpf-filter-label">Maks. cena</span>
            <span className="fpf-price-value">{pln(maxPrice)}</span>
          </div>
          <div className="fpf-slider-track">
            <div className="fpf-slider-fill" style={{ width: `${pct}%` }} />
            <input
              type="range"
              className="fpf-slider"
              min={1000}
              max={maxPriceLimit}
              step={500}
              value={maxPrice}
              onChange={(e) => onPriceChange(Number(e.target.value))}
            />
          </div>
          <div className="fpf-slider-bounds">
            <span>1 000 zł</span>
            <span>{pln(maxPriceLimit)}</span>
          </div>
        </div>

      </div>

      <style>{`
        .fpf-root {
          margin-bottom: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        /* ── Row layout ── */
        .fpf-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .fpf-row--top {
          justify-content: space-between;
        }

        .fpf-row--filters {
          align-items: flex-start;
          gap: 1.5rem;
          padding: 1.2rem 1.4rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(46,122,181,0.1);
          border-radius: 12px;
        }

        /* ── Category tabs ── */
        .fpf-tabs {
          display: flex;
          gap: 0.35rem;
          flex-wrap: wrap;
          flex: 1;
        }

        .fpf-tab {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.48rem 1.1rem;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(46,122,181,0.12);
          cursor: pointer;
          transition: border-color 0.22s, background 0.22s;
          clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
          position: relative; overflow: hidden;
        }

        .fpf-tab::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(110deg, #2e7ab5, #4e9930);
          opacity: 0; transition: opacity 0.25s;
        }

        .fpf-tab:hover { border-color: rgba(79,163,212,0.35); }
        .fpf-tab:hover::after { opacity: 0.08; }
        .fpf-tab--active { border-color: rgba(109,191,69,0.5); background: rgba(109,191,69,0.05); }
        .fpf-tab--active::after { opacity: 0.14; }

        .fpf-tab-icon {
          font-size: 0.68rem; position: relative; z-index: 1;
          color: rgba(220,232,240,0.3); transition: color 0.22s; line-height: 1;
        }

        .fpf-tab:hover .fpf-tab-icon,
        .fpf-tab--active .fpf-tab-icon { color: #6dbf45; }

        .fpf-tab-label {
          position: relative; z-index: 1;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600; font-size: 0.68rem;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: #5a7080; transition: color 0.22s;
        }

        .fpf-tab:hover .fpf-tab-label { color: #b0c8d8; }
        .fpf-tab--active .fpf-tab-label { color: #dce8f0; }

        /* ── Meta (count + reset) ── */
        .fpf-meta {
          display: flex; align-items: center; gap: 1rem; flex-shrink: 0;
        }

        .fpf-count {
          display: flex; align-items: baseline; gap: 0.3rem;
        }

        .fpf-count-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.8rem; letter-spacing: 0.06em; line-height: 1;
          background: linear-gradient(90deg, #4fa3d4, #6dbf45);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        .fpf-count-of {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1rem; color: #2a3a4a; letter-spacing: 0.06em;
        }

        .fpf-count-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.6rem; font-weight: 300;
          letter-spacing: 0.25em; text-transform: uppercase; color: #3d5060;
        }

        .fpf-reset {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600; font-size: 0.6rem;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: #5a3a3a; background: none;
          border: 1px solid rgba(200,60,60,0.2);
          padding: 0.3rem 0.75rem; cursor: pointer;
          clip-path: polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%);
          transition: color 0.2s, border-color 0.2s;
        }

        .fpf-reset:hover { color: #ff8080; border-color: rgba(255,80,80,0.4); }

        /* ── Filter groups ── */
        .fpf-filter-group {
          display: flex; flex-direction: column; gap: 0.5rem;
          flex-shrink: 0;
        }

        .fpf-filter-group--price {
          flex: 1; min-width: 180px;
        }

        .fpf-filter-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600; font-size: 0.58rem;
          letter-spacing: 0.3em; text-transform: uppercase;
          color: #3d5060;
        }

        /* ── Pills ── */
        .fpf-pills {
          display: flex; gap: 0.3rem; flex-wrap: wrap;
        }

        .fpf-pill {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600; font-size: 0.62rem;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: #4a6070;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(46,122,181,0.1);
          padding: 0.28rem 0.7rem;
          cursor: pointer;
          border-radius: 3px;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
          white-space: nowrap;
        }

        .fpf-pill:hover {
          color: #90b8c8;
          border-color: rgba(79,163,212,0.3);
        }

        .fpf-pill--active {
          color: #dce8f0;
          border-color: rgba(109,191,69,0.5);
          background: rgba(109,191,69,0.08);
        }

        /* ── Price slider ── */
        .fpf-price-header {
          display: flex; justify-content: space-between; align-items: baseline;
        }

        .fpf-price-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1rem; letter-spacing: 0.06em;
          background: linear-gradient(90deg, #4fa3d4, #6dbf45);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        .fpf-slider-track {
          position: relative; height: 4px;
          background: rgba(46,122,181,0.1);
          border-radius: 2px; margin: 0.2rem 0;
        }

        .fpf-slider-fill {
          position: absolute; left: 0; top: 0; bottom: 0;
          background: linear-gradient(90deg, #2e7ab5, #6dbf45);
          border-radius: 2px; pointer-events: none; transition: width 0.05s;
        }

        .fpf-slider {
          position: absolute; inset: 0; width: 100%; margin: 0;
          height: 100%; opacity: 0; cursor: pointer;
          -webkit-appearance: none; appearance: none;
        }

        .fpf-slider-track::after {
          content: '';
          position: absolute; top: 50%;
          left: var(--thumb-pct, 50%);
          transform: translate(-50%, -50%);
          width: 13px; height: 13px; border-radius: 50%;
          background: #6dbf45;
          box-shadow: 0 0 10px rgba(109,191,69,0.6), 0 0 0 3px rgba(109,191,69,0.12);
          pointer-events: none;
        }

        .fpf-slider-bounds {
          display: flex; justify-content: space-between;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.55rem; font-weight: 300;
          letter-spacing: 0.15em; color: #2a3a4a;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .fpf-row--filters { flex-direction: column; }
          .fpf-filter-group--price { width: 100%; }
        }

        @media (max-width: 640px) {
          .fpf-row--top { flex-direction: column; align-items: flex-start; }
          .fpf-meta { width: 100%; justify-content: space-between; }
        }
      `}</style>
    </div>
  );
}