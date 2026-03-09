'use client';
import type { Category } from './types';
import { CATEGORIES } from './types';

interface FleetFiltersProps {
  activeCategory: Category;
  onCategoryChange: (cat: Category) => void;
  maxPrice: number;
  onPriceChange: (price: number) => void;
  maxPriceLimit: number;
}

export default function FleetFilters({
  activeCategory,
  onCategoryChange,
  maxPrice,
  onPriceChange,
  maxPriceLimit,
}: FleetFiltersProps) {
  const pct = ((maxPrice / maxPriceLimit) * 100).toFixed(0);

  return (
    <>
      {/* Category tabs */}
      <div className="fl-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`fl-tab${activeCategory === cat ? ' active' : ''}`}
            onClick={() => onCategoryChange(cat)}
          >
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Price filter */}
      <div className="fl-price-bar">
        <span className="fl-price-label">Maks. cena</span>
        <input
          type="range"
          className="fl-price-slider"
          min={100}
          max={maxPriceLimit}
          step={10}
          value={maxPrice}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          style={{
            background: `linear-gradient(90deg, var(--blue) 0%, var(--green) ${pct}%, #1a2230 ${pct}%)`,
          }}
        />
        <span className="fl-price-value">{maxPrice} zł</span>
      </div>
    </>
  );
}
