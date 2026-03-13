"use client";

import type { Category } from "./types";

export type FuelType =
  | "Wszystkie"
  | "benzyna"
  | "diesel"
  | "elektryczny"
  | "hybryda"
  | "LPG";

export type GearboxType = "Wszystkie" | "manualna" | "automatyczna";

export type SeatsOption = "Wszystkie" | "2" | "4" | "5" | "7+";

type CarsFiltersProps = {
  activeCategory: Category;
  onCategoryChange: (c: Category) => void;
  maxPrice: number;
  onPriceChange: (v: number) => void;
  maxPriceLimit: number;
  fuelType: FuelType;
  onFuelChange: (v: FuelType) => void;
  gearbox: GearboxType;
  onGearboxChange: (v: GearboxType) => void;
  seats: SeatsOption;
  onSeatsChange: (v: SeatsOption) => void;
  totalCount: number;
  filteredCount: number;
  onReset: () => void;
};

const CATEGORIES = [
  "Wszystkie",
  "ekonomiczny",
  "komfort",
  "premium",
  "SUV",
  "van",
] as const;

const SELECT_CLASS =
  "h-9 w-full rounded-lg bg-[#080c11] border border-white/8 text-[13px] text-[#c8d8e6] px-3 pr-8 " +
  "appearance-none cursor-pointer transition-colors " +
  "hover:border-white/20 focus:outline-none focus:border-[#6dbf45]/50 focus:ring-1 focus:ring-[#6dbf45]/20 " +
  "bg-[image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%235b6c7d' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")] " +
  "bg-no-repeat bg-[right_12px_center]";

const LABEL_CLASS =
  "text-[10px] font-['Barlow_Condensed'] uppercase tracking-[0.36em] text-[#4a5e6d] select-none";

export default function CarsFilters(props: CarsFiltersProps) {
  const {
    activeCategory,
    onCategoryChange,
    maxPrice,
    onPriceChange,
    maxPriceLimit,
    fuelType,
    onFuelChange,
    gearbox,
    onGearboxChange,
    seats,
    onSeatsChange,
    totalCount,
    filteredCount,
    onReset,
  } = props;

  const pct = maxPriceLimit > 0 ? (maxPrice / maxPriceLimit) * 100 : 0;

  return (
    <section className="mt-4 mb-6 rounded-2xl bg-[#070b10] border border-white/[0.07] overflow-hidden shadow-[0_4px_40px_rgba(0,0,0,0.5)]">
      {/* Top accent line */}
      <div className="h-px bg-linear-to-r from-transparent via-[#6dbf45]/30 to-transparent" />

      <div className="px-5 py-5 sm:px-7 sm:py-6 flex flex-col gap-5">

        {/* ── Kategorie + licznik ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => {
              const isActive = cat === activeCategory;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onCategoryChange(cat as Category)}
                  className={[
                    "px-3.5 py-1.5 rounded-full text-[11px] font-['Barlow_Condensed'] tracking-[0.2em] uppercase border transition-all duration-200",
                    isActive
                      ? "bg-[#6dbf45]/12 border-[#6dbf45]/50 text-[#a8d98a] shadow-[0_0_12px_rgba(109,191,69,0.1)]"
                      : "bg-transparent border-white/8 text-[#56717f] hover:text-[#8faebf] hover:border-white/20 hover:bg-white/3",
                  ].join(" ")}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex items-baseline gap-1.5 text-[#4a5e6d] shrink-0">
            <span className="text-base font-['Barlow_Condensed'] font-semibold tabular-nums text-[#7eafca]">
              {filteredCount}
            </span>
            <span className="text-[10px] tracking-[0.28em] uppercase font-['Barlow_Condensed']">
              z {totalCount} pojazdów
            </span>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-white/5" />

        {/* ── Filtry szczegółowe ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 items-end">

          {/* Cena */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className={LABEL_CLASS}>Maks. cena / dobę</label>
              <span className="text-[13px] font-['Barlow_Condensed'] font-semibold text-[#a8d98a] tabular-nums">
                {maxPrice.toLocaleString("pl-PL")} zł
              </span>
            </div>

            {/* Custom range track */}
            <div className="relative h-5 flex items-center">
              <div className="absolute inset-x-0 h-0.75 rounded-full bg-white/8" />
              <div
                className="absolute left-0 h-0.75 rounded-full bg-linear-to-r from-[#4fa3d4]/60 to-[#6dbf45] transition-all duration-150"
                style={{ width: `${pct}%` }}
              />
              <input
                type="range"
                min={0}
                max={maxPriceLimit}
                step={100}
                value={maxPrice}
                onChange={(e) => onPriceChange(Number(e.target.value))}
                className={[
                  "relative w-full h-0.75 appearance-none bg-transparent cursor-pointer",
                  /* thumb */
                  "[&::-webkit-slider-thumb]:appearance-none",
                  "[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4",
                  "[&::-webkit-slider-thumb]:rounded-full",
                  "[&::-webkit-slider-thumb]:bg-white",
                  "[&::-webkit-slider-thumb]:shadow-[0_0_0_2px_rgba(109,191,69,0.5),0_1px_6px_rgba(0,0,0,0.6)]",
                  "[&::-webkit-slider-thumb]:transition-transform",
                  "[&::-webkit-slider-thumb]:hover:scale-110",
                  "[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4",
                  "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0",
                  "[&::-moz-range-thumb]:bg-white",
                  "[&::-moz-range-thumb]:shadow-[0_0_0_2px_rgba(109,191,69,0.5)]",
                ].join(" ")}
              />
            </div>

            {/* Min/max hints */}
            <div className="flex justify-between text-[9px] tracking-widest text-[#3a4f5c] font-['Barlow_Condensed'] uppercase">
              <span>0 zł</span>
              <span>{maxPriceLimit.toLocaleString("pl-PL")} zł</span>
            </div>
          </div>

          {/* Paliwo */}
          <div className="flex flex-col gap-2">
            <label className={LABEL_CLASS}>Paliwo</label>
            <select
              value={fuelType}
              onChange={(e) => onFuelChange(e.target.value as FuelType)}
              className={SELECT_CLASS}
            >
              <option value="Wszystkie">Wszystkie</option>
              <option value="benzyna">Benzyna</option>
              <option value="diesel">Diesel</option>
              <option value="elektryczny">Elektryczny</option>
              <option value="hybryda">Hybryda</option>
              <option value="LPG">LPG</option>
            </select>
          </div>

          {/* Skrzynia */}
          <div className="flex flex-col gap-2">
            <label className={LABEL_CLASS}>Skrzynia biegów</label>
            <select
              value={gearbox}
              onChange={(e) => onGearboxChange(e.target.value as GearboxType)}
              className={SELECT_CLASS}
            >
              <option value="Wszystkie">Wszystkie</option>
              <option value="manualna">Manualna</option>
              <option value="automatyczna">Automatyczna</option>
            </select>
          </div>

          {/* Miejsca */}
          <div className="flex flex-col gap-2">
            <label className={LABEL_CLASS}>Liczba miejsc</label>
            <select
              value={seats}
              onChange={(e) => onSeatsChange(e.target.value as SeatsOption)}
              className={SELECT_CLASS}
            >
              <option value="Wszystkie">Wszystkie</option>
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="7+">7+</option>
            </select>
          </div>
        </div>

        {/* ── Reset ── */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onReset}
            className={[
              "inline-flex items-center gap-2 text-[10px] font-['Barlow_Condensed'] uppercase tracking-[0.32em]",
              "text-[#3d6f8a] border border-[#3d6f8a]/30 px-4 py-1.5 rounded-full",
              "transition-all duration-200",
              "hover:text-[#6ab0cf] hover:border-[#6ab0cf]/50 hover:bg-[#4fa3d4]/5",
            ].join(" ")}
          >
            {/* X icon */}
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" className="shrink-0">
              <line x1="1" y1="1" x2="8" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="8" y1="1" x2="1" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Wyczyść filtry
          </button>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-px bg-linear-to-r from-transparent via-white/4 to-transparent" />
    </section>
  );
}