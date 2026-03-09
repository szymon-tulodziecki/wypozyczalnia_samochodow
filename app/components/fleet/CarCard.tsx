'use client';
import Image from 'next/image';
import type { Car } from './types';

export default function CarCard({ car }: { car: Car }) {
  return (
    <div className="fl-card">
      <div className="fl-card-img">
        <Image src={car.img} alt={car.name} fill style={{ objectFit: 'cover' }} />
        <span className="fl-card-badge">{car.category}</span>
      </div>
      <div className="fl-card-body">
        <div className="fl-card-name">{car.name}</div>
        <div className="fl-card-price-row">
          <span className="fl-card-price">{car.price}</span>
          <span className="fl-card-price-unit">zł / dzień</span>
        </div>
        <div className="fl-card-specs">
          <span className="fl-card-spec">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {car.seats} os.
          </span>
          <span className="fl-card-spec">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93A10 10 0 0 0 4.93 19.07"/>
              <path d="M19.07 19.07A10 10 0 0 0 4.93 4.93"/>
            </svg>
            {car.transmission}
          </span>
          <span className="fl-card-spec">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 22V8l9-6 9 6v14H3z"/><path d="M9 22V12h6v10"/>
            </svg>
            {car.fuel}
          </span>
        </div>
        <div className="fl-card-cta">
          <button className="fl-card-link">Szczegóły</button>
          <button className="fl-card-book">Zarezerwuj →</button>
        </div>
      </div>
    </div>
  );
}
