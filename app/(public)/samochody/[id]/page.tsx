'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { carsAPI } from '@/lib/api';
import type { Car } from '@/types';
import { ArrowLeft, Fuel, Settings, Users, Calendar, CheckCircle2, Phone } from 'lucide-react';

const pln = (n: number) =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(n);

const formatDescription = (text: string) => {
  if (!text) return '';
  return text.split('\\n').join('\n');
};

const FUEL_LABEL: Record<string, string> = {
  benzyna: 'Benzyna', diesel: 'Diesel', elektryczny: 'Elektryczny', hybryda: 'Hybryda', LPG: 'LPG',
};

const STATUS_CLS: Record<string, string> = {
  dostepny: 'bg-[#6dbf45]/10 text-[#6dbf45] border border-[#6dbf45]/30',
  wynajety: 'bg-[#2e7ab5]/10 text-[#2e7ab5] border border-[#2e7ab5]/30',
  serwis:   'bg-amber-500/10 text-amber-400 border border-amber-500/30',
};
const STATUS_LABEL: Record<string, string> = { dostepny: 'Dostępny', wynajety: 'Wynajęty', serwis: 'W serwisie' };

export default function CarDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const [car, setCar]         = useState<Car | null>(null);
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
      <div className="w-10 h-10 rounded-full border-2 border-[#2e7ab5] border-t-transparent animate-spin" />
    </div>
  );

  if (!car) return null;

  const images = car.images?.length ? car.images : ['/auto.jpg'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600&family=Barlow:wght@300;400&display=swap');

        :root {
          --cd-blue:        #2e7ab5;
          --cd-blue-light:  #5ba3d8;
          --cd-green:       #6dbf45;
          --cd-green-dark:  #4a8c2a;
          --cd-bg:          #08090b;
          --cd-surface:     rgba(16,24,32,0.55);
          --cd-border:      rgba(255,255,255,0.055);
          --cd-text-dim:    #7c9aac;
          --cd-text-mid:    #b8c4d0;
        }

        /* ── Base ── */
        .cd-page {
          background: var(--cd-bg);
          color: #fff;
          font-family: 'Barlow', sans-serif;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        /* Grid bg */
        .cd-page::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(46,122,181,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46,122,181,0.035) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none; z-index: 0;
        }

        /* Ambient blobs */
        .cd-glow-blue {
          position: fixed;
          top: -80px; right: -80px;
          width: 340px; height: 340px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(46,122,181,0.1) 0%, transparent 65%);
          pointer-events: none; z-index: 0;
        }
        .cd-glow-green {
          position: fixed;
          bottom: 0; left: -100px;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(109,191,69,0.065) 0%, transparent 65%);
          pointer-events: none; z-index: 0;
        }

        /* ── Panel ── */
        .cd-panel {
          background: var(--cd-surface);
          border: 1px solid var(--cd-border);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-radius: 16px;
        }

        /* ── Typography ── */
        .cd-eyebrow {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600; font-size: 0.6rem;
          letter-spacing: 0.36em; text-transform: uppercase;
          color: var(--cd-green);
          display: flex; align-items: center; gap: 0.65rem;
          margin-bottom: 0.5rem;
        }
        .cd-eyebrow::before {
          content: '';
          display: block; width: 22px; height: 1px;
          background: linear-gradient(90deg, var(--cd-blue), var(--cd-green));
          flex-shrink: 0;
        }

        .cd-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.2rem, 7vw, 3.4rem);
          line-height: 0.95;
          letter-spacing: 0.04em;
          background: linear-gradient(110deg, #ffffff 0%, #c8dde8 60%, var(--cd-blue-light) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cd-price {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.4rem, 8vw, 3rem);
          color: var(--cd-blue-light);
          line-height: 1;
        }

        /* ── Stat tile ── */
        .cd-stat {
          display: flex; align-items: center; gap: 0.85rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--cd-border);
          border-radius: 10px;
          padding: 0.75rem 0.9rem;
          transition: border-color 0.2s;
        }
        .cd-stat:hover { border-color: rgba(79,163,212,0.22); }

        .cd-stat-icon {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: rgba(46,122,181,0.1);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .cd-stat-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.58rem; letter-spacing: 0.3em;
          text-transform: uppercase; color: var(--cd-text-dim);
          line-height: 1;
        }
        .cd-stat-value {
          font-size: 0.875rem; font-weight: 500;
          color: #e8f0f8; line-height: 1.2;
          margin-top: 2px;
        }

        /* ── CTA button ── */
        .cd-btn-cta {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          gap: 0.65rem;
          width: 100%;
          padding: 1rem 1.5rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600; font-size: 0.9rem;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #fff;
          background: none;
          border: 1px solid rgba(109,191,69,0.45);
          cursor: pointer;
          clip-path: polygon(14px 0%, 100% 0%, calc(100% - 14px) 100%, 0% 100%);
          overflow: hidden;
          transition: border-color 0.3s;
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
        }
        .cd-btn-cta::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(110deg, var(--cd-blue) 0%, var(--cd-green-dark) 100%);
          opacity: 0.22; transition: opacity 0.3s;
        }
        .cd-btn-cta::after {
          content: '';
          position: absolute;
          top: 0; left: -100%; bottom: 0; width: 60%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
          transition: left 0.5s ease;
        }
        .cd-btn-cta:hover                 { border-color: rgba(109,191,69,0.85); }
        .cd-btn-cta:hover::before          { opacity: 0.55; }
        .cd-btn-cta:hover::after           { left: 160%; }
        .cd-btn-cta:active::before         { opacity: 0.75; }
        .cd-btn-cta span, .cd-btn-cta svg  { position: relative; z-index: 1; }

        /* ── Back button ── */
        .cd-back {
          display: inline-flex; align-items: center; gap: 0.45rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.68rem; letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--cd-text-dim);
          background: none; border: none; cursor: pointer;
          padding: 0.5rem 0;
          transition: color 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .cd-back:hover { color: #fff; }

        /* ── Thumbnail strip ── */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        /* ── Feature chip ── */
        .cd-feature {
          display: flex; align-items: center; gap: 0.6rem;
          font-size: 0.78rem; color: var(--cd-text-mid);
          background: rgba(255,255,255,0.035);
          border: 1px solid var(--cd-border);
          border-radius: 8px;
          padding: 0.6rem 0.85rem;
          transition: border-color 0.2s;
        }
        .cd-feature:hover { border-color: rgba(109,191,69,0.2); }

        /* ── Section heading ── */
        .cd-section-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(1.6rem, 5vw, 2.2rem);
          letter-spacing: 0.06em;
          color: #e8f0f8;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        /* ── Agent card ── */
        .cd-agent {
          display: flex; flex-direction: column;
          gap: 1.25rem;
          padding: 1.25rem;
          border-radius: 14px;
          background: var(--cd-surface);
          border: 1px solid var(--cd-border);
          border-left: 3px solid var(--cd-blue);
          backdrop-filter: blur(14px);
        }
        .cd-agent-avatar {
          width: 52px; height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--cd-blue) 0%, var(--cd-green-dark) 100%);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem; font-weight: 700; color: #fff;
          flex-shrink: 0;
          box-shadow: 0 0 0 3px rgba(46,122,181,0.18);
        }
        .cd-agent-call {
          display: flex; align-items: center; justify-content: center; gap: 0.55rem;
          width: 100%;
          padding: 0.75rem 1.25rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem; font-weight: 600;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--cd-text-mid);
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--cd-border);
          border-radius: 10px;
          text-decoration: none;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .cd-agent-call:hover { background: rgba(255,255,255,0.1); border-color: rgba(91,163,216,0.35); color: #fff; }

        /* ── Divider ── */
        .cd-divider {
          width: 80px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          margin: 0 auto;
        }

        /* ── Tablet ≥ 640px ── */
        @media (min-width: 640px) {
          .cd-glow-blue  { top: 0; right: 0; width: 480px; height: 480px; }
          .cd-glow-green { width: 400px; height: 400px; }
          .cd-agent      { flex-direction: row; align-items: center; justify-content: space-between; padding: 1.5rem 2rem; }
          .cd-agent-call { width: auto; white-space: nowrap; }
        }

        /* ── Desktop ≥ 1024px ── */
        @media (min-width: 1024px) {
          .cd-glow-blue  { top: -10%; right: 5%; width: 650px; height: 650px; }
          .cd-agent      { padding: 1.75rem 2.5rem; }
        }
      `}</style>

      <div className="cd-page pt-20 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="cd-glow-blue" />
        <div className="cd-glow-green" />

        <div className="max-w-7xl mx-auto relative z-10">

          {/* Back */}
          <button onClick={() => router.back()} className="cd-back mb-5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Wróć do floty
          </button>

          {/* ── Main grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start">

            {/* Left — gallery */}
            <div className="lg:col-span-7 flex flex-col gap-2.5">

              {/* Main image */}
              <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-black/40 border border-white/5 shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
                <Image
                  src={images[activeImg]}
                  alt={`${car.brand} ${car.model}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover transition-opacity duration-300"
                  priority
                />
                {/* status badge */}
                <span className={`absolute top-3 left-3 text-[10px] font-['Barlow_Condensed'] font-bold px-2.5 py-1 rounded-sm uppercase tracking-[0.2em] backdrop-blur-md z-20 ${STATUS_CLS[car.status] ?? 'bg-gray-800/80 text-gray-300'}`}>
                  {STATUS_LABEL[car.status] ?? car.status}
                </span>
                {/* subtle bottom vignette */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-10" />
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
                  {images.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={[
                        "relative shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200",
                        "w-20 h-14 sm:w-24 sm:h-16",
                        activeImg === i
                          ? "border-[#6dbf45] opacity-100 shadow-[0_0_8px_rgba(109,191,69,0.3)]"
                          : "border-transparent opacity-35 hover:opacity-80",
                      ].join(" ")}
                    >
                      <Image src={src} alt="" fill sizes="96px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right — info panel */}
            <div className="lg:col-span-5 cd-panel p-5 sm:p-7 flex flex-col gap-6">

              {/* Header */}
              <div>
                <p className="cd-eyebrow">{car.category}</p>
                <h1 className="cd-title">{car.brand} {car.model}</h1>
              </div>

              {/* Price */}
              <div className="flex items-end gap-2 pb-5 border-b border-white/[0.06]">
                <span className="cd-price">{pln(car.price_per_day)}</span>
                <span className="text-[#4a6070] font-['Barlow_Condensed'] uppercase tracking-widest text-[11px] pb-1.5">/ dobę</span>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { icon: Fuel,     label: 'Paliwo',   value: FUEL_LABEL[car.fuel_type] ?? car.fuel_type },
                  { icon: Settings, label: 'Skrzynia', value: car.gearbox === 'automatyczna' ? 'Automatyczna' : 'Manualna' },
                  { icon: Calendar, label: 'Rocznik',  value: `${car.year}` },
                  { icon: Users,    label: 'Miejsca',  value: `${car.seats ?? 5}` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="cd-stat">
                    <div className="cd-stat-icon">
                      <Icon className="w-4 h-4 text-[#5ba3d8]" />
                    </div>
                    <div>
                      <p className="cd-stat-label">{label}</p>
                      <p className="cd-stat-value">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-auto pt-2">
                {car.status === 'dostepny' ? (
                  <a href="tel:+48000000000" className="cd-btn-cta">
                    <Phone className="w-4 h-4" />
                    <span>Zarezerwuj teraz</span>
                  </a>
                ) : (
                  <div className="w-full text-center py-3.5 rounded-xl border border-dashed border-white/15 text-[#3d5060] font-['Barlow_Condensed'] text-xs uppercase tracking-widest bg-white/[0.02]">
                    Pojazd niedostępny
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Bottom sections ── */}
          <div className="mt-8 sm:mt-12 space-y-4 sm:space-y-6">

            {/* Description + features */}
            {(car.description || car.features?.length) && (
              <div className="cd-panel p-5 sm:p-10">
                {car.description && (
                  <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10">
                    <h2 className="cd-section-title">O pojeździe</h2>
                    <p className="text-[#8faebf] font-light leading-relaxed whitespace-pre-line text-[0.92rem] sm:text-base">
                      {formatDescription(car.description)}
                    </p>
                  </div>
                )}

                {car.description && car.features?.length ? (
                  <div className="cd-divider mb-8 sm:mb-10" />
                ) : null}

                {car.features?.length ? (
                  <div className="max-w-5xl mx-auto">
                    <h2 className="cd-section-title">Wyposażenie</h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                      {car.features.map((f, i) => (
                        <li key={i} className="cd-feature">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#6dbf45] shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}

            {/* Agent */}
            {car.agent && (
              <div className="cd-agent">
                <div className="flex items-center gap-4">
                  <div className="cd-agent-avatar">
                    {car.agent.first_name?.[0]}{car.agent.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-['Barlow_Condensed'] text-[#3d5565] uppercase tracking-[0.28em] text-[10px] mb-0.5">
                      Twój opiekun oferty
                    </p>
                    <p className="font-medium text-white text-lg leading-tight">
                      {car.agent.first_name} {car.agent.last_name}
                    </p>
                    {car.agent.phone && (
                      <p className="text-[#5ba3d8] text-sm mt-0.5 font-light">{car.agent.phone}</p>
                    )}
                  </div>
                </div>

                {car.agent.phone && (
                  <a href={`tel:${car.agent.phone}`} className="cd-agent-call">
                    <Phone className="w-3.5 h-3.5" />
                    Zadzwoń do opiekuna
                  </a>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}