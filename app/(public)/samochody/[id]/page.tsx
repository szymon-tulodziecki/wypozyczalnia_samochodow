'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { carsAPI } from '@/lib/api';
import type { Car } from '@/types';
import { ArrowLeft, Fuel, Settings, Users, Calendar, CheckCircle2, Phone } from 'lucide-react';

const pln = (n: number) =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(n);

const FUEL_LABEL: Record<string, string> = {
  benzyna: 'Benzyna', diesel: 'Diesel', elektryczny: 'Elektryczny', hybryda: 'Hybryda', LPG: 'LPG',
};

const STATUS_CLS: Record<string, string> = {
  dostepny: 'bg-[#6dbf45]/10 text-[#6dbf45] border border-[#6dbf45]/30',
  wynajety: 'bg-[#2e7ab5]/10 text-[#2e7ab5] border border-[#2e7ab5]/30',
  serwis: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
};
const STATUS_LABEL: Record<string, string> = { dostepny: 'Dostępny', wynajety: 'Wynajęty', serwis: 'W serwisie' };

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    carsAPI.getById(id)
      .then(setCar)
      .catch(() => router.replace('/samochody'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return (
    <div className="cd-page flex justify-center items-center min-h-screen">
      <div className="w-12 h-12 rounded-full border-2 border-[#2e7ab5] border-t-transparent animate-spin" />
    </div>
  );

  if (!car) return null;

  const images = car.images?.length ? car.images : ['/auto.jpg'];

  return (
    <>
      <style>{`
        :root {
          --cd-blue: #2e7ab5;
          --cd-blue-light: #5ba3d8;
          --cd-green: #6dbf45;
          --cd-green-dark: #4a8c2a;
          --cd-bg: #08090b;
        }

        .cd-page {
          background: var(--cd-bg);
          color: #ffffff;
          font-family: 'Barlow', sans-serif;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        /* Subtelna siatka z Hero */
        .cd-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(46,122,181,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46,122,181,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }

        /* Światła w tle */
        .cd-glow-top {
          position: absolute;
          top: -20%; right: 10%;
          width: 700px; height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(46,122,181,0.08) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        .cd-panel {
          background: rgba(20, 28, 36, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border-radius: 16px;
        }

        .cd-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.5rem, 4vw, 3.5rem);
          line-height: 1;
          letter-spacing: 0.04em;
          background: linear-gradient(110deg, #ffffff 0%, #c8dde8 60%, var(--cd-blue-light) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .cd-price {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 3rem;
          color: var(--cd-blue-light);
          line-height: 1;
        }

        /* Guzik z uciętymi rogami z Hero */
        .cd-btn-primary {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1.2rem 2rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 1rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #fff;
          background: none;
          border: 1px solid rgba(109,191,69,0.5);
          cursor: pointer;
          clip-path: polygon(16px 0%, 100% 0%, calc(100% - 16px) 100%, 0% 100%);
          transition: border-color 0.3s;
          width: 100%;
        }
        .cd-btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(110deg, var(--cd-blue) 0%, var(--cd-green-dark) 100%);
          opacity: 0.3;
          transition: opacity 0.3s;
        }
        .cd-btn-primary:hover { border-color: rgba(109,191,69,1); }
        .cd-btn-primary:hover::before { opacity: 0.7; }
        .cd-btn-primary span, .cd-btn-primary svg { position: relative; z-index: 1; }
      `}</style>

      <div className="cd-page py-12 px-4 sm:px-6 lg:px-8">
        <div className="cd-glow-top" />
        
        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          
          {/* Powrót */}
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#b8c4d0] hover:text-white transition-colors font-['Barlow_Condensed'] uppercase tracking-wider text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Wróć do floty
          </button>

          {/* Główna sekcja: Galeria + Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Lewa: Galeria (szersza) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="cd-panel p-2">
                <div className="relative w-full aspect-16/10 rounded-xl overflow-hidden bg-black/50">
                  <Image
                    src={images[activeImg]}
                    alt={`${car.brand} ${car.model}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                    priority
                  />
                  <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-sm uppercase tracking-wider backdrop-blur-md ${STATUS_CLS[car.status] ?? 'bg-gray-800/80 text-gray-300'}`}>
                    {STATUS_LABEL[car.status] ?? car.status}
                  </span>
                </div>
              </div>

              {/* Miniaturki */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((src, i) => (
                    <button 
                      key={i} 
                      onClick={() => setActiveImg(i)}
                      className={`relative w-28 h-20 rounded-lg overflow-hidden shrink-0 transition-all duration-200 border-2 ${activeImg === i ? 'border-[#6dbf45] opacity-100' : 'border-transparent opacity-40 hover:opacity-100'}`}
                    >
                      <Image src={src} alt="" fill sizes="112px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Prawa: Skrócone Info i CTA */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-8">
              <div>
                <p className="text-[#6dbf45] font-['Barlow_Condensed'] uppercase tracking-[0.3em] text-sm mb-2 flex items-center gap-3">
                  <span className="w-8 h-px bg-linear-to-r from-[#2e7ab5] to-[#6dbf45]"></span>
                  {car.category}
                </p>
                <h1 className="cd-title">{car.brand} <br/>{car.model}</h1>
              </div>

              <div className="flex items-end gap-2">
                <div className="cd-price">{pln(car.price_per_day)}</div>
                <div className="text-[#b8c4d0] font-['Barlow_Condensed'] uppercase tracking-widest pb-1">/ dobę</div>
              </div>

              {/* Siatka parametrów */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Fuel, label: 'Paliwo', value: FUEL_LABEL[car.fuel_type] ?? car.fuel_type },
                  { icon: Settings, label: 'Skrzynia', value: car.gearbox === 'automatyczna' ? 'Automatyczna' : 'Manualna' },
                  { icon: Calendar, label: 'Rocznik', value: `${car.year}` },
                  { icon: Users, label: 'Miejsca', value: `${car.seats ?? 5}` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 border-b border-white/5 pb-3">
                    <Icon className="w-5 h-5 text-[#5ba3d8]" />
                    <div>
                      <p className="text-[10px] text-[#b8c4d0] uppercase tracking-widest">{label}</p>
                      <p className="text-sm font-medium text-white">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Akcja */}
              <div className="pt-4">
                {car.status === 'dostepny' ? (
                  <a href="tel:+48000000000" className="cd-btn-primary">
                    <Phone className="w-5 h-5" />
                    <span>Zarezerwuj teraz</span>
                  </a>
                ) : (
                  <div className="w-full text-center py-4 rounded-xl border border-dashed border-white/20 text-[#b8c4d0] font-['Barlow_Condensed'] uppercase tracking-widest">
                    Pojazd niedostępny
                  </div>
                )}
              </div>
            </div>
            
          </div>

          {/* Dolna sekcja: Detale i Opiekun */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8 border-t border-white/5">
            
            {/* Lewa: Opis i Wyposażenie */}
            <div className="lg:col-span-8 space-y-8">
              {car.description && (
                <div className="cd-panel p-8">
                  <h2 className="font-['Bebas_Neue'] text-2xl tracking-wide mb-4 text-white">O pojeździe</h2>
                  <p className="text-[#b8c4d0] font-light leading-relaxed whitespace-pre-line">
                    {car.description}
                  </p>
                </div>
              )}

              {car.features?.length ? (
                <div className="cd-panel p-8">
                  <h2 className="font-['Bebas_Neue'] text-2xl tracking-wide mb-6 text-white">Wyposażenie</h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {car.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-[#b8c4d0]">
                        <CheckCircle2 className="w-4 h-4 text-[#6dbf45] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {/* Prawa: Sidebar (np. Opiekun) */}
            <div className="lg:col-span-4">
              {car.agent && (
                <div className="cd-panel p-6 sticky top-24">
                  <h3 className="font-['Barlow_Condensed'] text-[#b8c4d0] uppercase tracking-widest text-sm mb-6">Opiekun oferty</h3>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-linear-to-br from-[#2e7ab5] to-[#4a8c2a] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {car.agent.first_name?.[0]}{car.agent.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-white text-lg">{car.agent.first_name} {car.agent.last_name}</p>
                      {car.agent.phone && <p className="text-[#5ba3d8] text-sm mt-1">{car.agent.phone}</p>}
                    </div>
                  </div>
                  {car.agent.phone && (
                    <a 
                      href={`tel:${car.agent.phone}`} 
                      className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-lg transition-colors font-['Barlow_Condensed'] uppercase tracking-widest text-sm"
                    >
                      <Phone className="w-4 h-4" /> Kontakt telefoniczny
                    </a>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </>
  );
}