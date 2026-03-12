"use client";

import type { Category } from "./types";

// Typy używane w liście samochodów i w filtrach
export type FuelType =
  | "Wszystkie"
  | "benzyna"
  | "diesel"
  | "elektryczny"
  | "hybryda"
  | "LPG";

export type GearboxType =
  | "Wszystkie"
  | "manualna"
  | "automatyczna";

export type SeatsOption =
  | "Wszystkie"
  | "2"
  | "4"
  | "5"
  | "7+";

type FleetFiltersProps = {
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

// Prosty, ale typowany komponent filtrów floty
export default function FleetFilters(props: FleetFiltersProps) {
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

  return (
    <section className="mt-4 mb-6 rounded-2xl bg-[#0b1016]/90 border border-white/5 px-4 py-4 sm:px-6 sm:py-5 backdrop-blur-md">
      <div className="flex flex-col gap-4 lg:gap-3">
        {/* Góra: kategorie + licznik */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              "Wszystkie",
              "ekonomiczny",
              "komfort",
              "premium",
              "SUV",
              "van",
            ].map((cat) => {
              const isActive = cat === activeCategory;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onCategoryChange(cat as Category)}
                  className={
                    "px-3 py-1.5 rounded-full text-xs font-['Barlow_Condensed'] tracking-[0.18em] uppercase border transition-colors " +
                    (isActive
                      ? "bg-[#6dbf45]/15 border-[#6dbf45]/60 text-[#dcefe0]"
                      : "bg-transparent border-white/10 text-[#7c92a6] hover:border-white/30")
                  }
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-['Barlow_Condensed'] uppercase tracking-[0.28em] text-[#5b6c7d]">
            {filteredCount} z {totalCount} pojazdów
          </div>
        </div>

        {/* Środek: cena + paliwo / skrzynia / miejsca */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          {/* Cena */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-['Barlow_Condensed'] uppercase tracking-[0.32em] text-[#5b6c7d]">
              Maksymalna cena / dobę
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={maxPriceLimit}
                step={100}
                value={maxPrice}
                onChange={(e) => onPriceChange(Number(e.target.value))}
                className="w-full accent-[#6dbf45]"
              />
              <span className="text-xs font-semibold text-[#dde7f0] whitespace-nowrap">
                {maxPrice.toLocaleString("pl-PL")} zł
              </span>
            </div>
          </div>

          {/* Paliwo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-['Barlow_Condensed'] uppercase tracking-[0.32em] text-[#5b6c7d]">
              Paliwo
            </label>
            <select
              value={fuelType}
              onChange={(e) => onFuelChange(e.target.value as FuelType)}
              className="h-9 rounded-md bg-[#05070b] border border-white/10 text-xs text-[#dde7f0] px-3"
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
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-['Barlow_Condensed'] uppercase tracking-[0.32em] text-[#5b6c7d]">
              Skrzynia biegów
            </label>
            <select
              value={gearbox}
              onChange={(e) => onGearboxChange(e.target.value as GearboxType)}
              className="h-9 rounded-md bg-[#05070b] border border-white/10 text-xs text-[#dde7f0] px-3"
            >
              <option value="Wszystkie">Wszystkie</option>
              <option value="manualna">Manualna</option>
              <option value="automatyczna">Automatyczna</option>
            </select>
          </div>

          {/* Miejsca */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-['Barlow_Condensed'] uppercase tracking-[0.32em] text-[#5b6c7d]">
              Liczba miejsc
            </label>
            <select
              value={seats}
              onChange={(e) => onSeatsChange(e.target.value as SeatsOption)}
              className="h-9 rounded-md bg-[#05070b] border border-white/10 text-xs text-[#dde7f0] px-3"
            >
              <option value="Wszystkie">Wszystkie</option>
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="7+">7+</option>
            </select>
          </div>
        </div>

        {/* Dół: reset */}
        <div className="flex justify-between items-center pt-1">
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] font-['Barlow_Condensed'] uppercase tracking-[0.3em] text-[#4fa3d4] border border-[#4fa3d4]/40 px-3 py-1 rounded-sm hover:border-[#4fa3d4]/70"
          >
            Wyczyść filtry
          </button>
        </div>
      </div>
    </section>
  );
}