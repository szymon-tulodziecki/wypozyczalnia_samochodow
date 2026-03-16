'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { carsAPI } from '@/lib/api';
import type { Car } from '@/types';
import {
  ArrowLeft, Fuel, Settings, Users, Calendar,
  CheckCircle2, Phone, ChevronLeft, ChevronRight, X, ZoomIn,
} from 'lucide-react';

const pln = (n: number) =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(n);

const FUEL_LABEL: Record<string, string> = {
  benzyna: 'Benzyna', diesel: 'Diesel', elektryczny: 'Elektryczny', hybryda: 'Hybryda', LPG: 'LPG',
};
const STATUS_COLOR: Record<string, string> = {
  dostepny: '#6dbf45', wynajety: '#4fa3d4', serwis: '#f59e0b',
};
const STATUS_LABEL: Record<string, string> = {
  dostepny: 'Dostępny', wynajety: 'Wynajęty', serwis: 'W serwisie',
};

export default function CarDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const [car, setCar]           = useState<Car | null>(null);
  const [loading, setLoading]   = useState(true);
  const [idx, setIdx]           = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [lbIdx, setLbIdx]       = useState(0);

  useEffect(() => {
    carsAPI.getById(id)
      .then(setCar)
      .catch(() => router.replace('/cars'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const openLightbox = (i: number) => { setLbIdx(i); setLightbox(true); };
  const closeLightbox = useCallback(() => setLightbox(false), []);

  useEffect(() => {
    if (!lightbox) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (!car) return;
      const imgs = car.images?.length ? car.images : ['/auto.jpg'];
      if (e.key === 'ArrowLeft')  setLbIdx(i => (i - 1 + imgs.length) % imgs.length);
      if (e.key === 'ArrowRight') setLbIdx(i => (i + 1) % imgs.length);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [lightbox, car, closeLightbox]);

  if (loading) return (
    <div style={{ background: '#06080a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #4fa3d4', borderTopColor: 'transparent', animation: 'sp .7s linear infinite' }} />
      <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!car) return null;

  const images = car.images?.length ? car.images : ['/auto.jpg'];
  const total  = images.length;
  const prev   = () => setIdx(i => (i - 1 + total) % total);
  const next   = () => setIdx(i => (i + 1) % total);
  const lbPrev = () => setLbIdx(i => (i - 1 + total) % total);
  const lbNext = () => setLbIdx(i => (i + 1) % total);
  const sc     = STATUS_COLOR[car.status] ?? '#888';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:ital,wght@0,300;0,400;0,600;1,400&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        /* ── GŁÓWNY KONTENER BARIERY ── */
        .dp {
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden; 
          font-family: 'Barlow', sans-serif;
          -webkit-font-smoothing: antialiased; color: #fff;
          background: #06080a;
        }
        .dp::before {
          content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(46,122,181,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46,122,181,.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        /* Topbar */
        .dp-topbar {
          flex-shrink: 0;
          position: relative; z-index: 40;
          display: flex; align-items: center; gap: .75rem;
          padding: 100px 2vw 1rem; 
          background: transparent; border-bottom: 1px solid rgba(255,255,255,.06);
        }
        .dp-back {
          display: inline-flex; align-items: center; gap: .4rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: .62rem; letter-spacing: .28em; text-transform: uppercase;
          color: #567080; background: none; border: none; cursor: pointer;
          transition: color .2s; padding: .3rem 0;
          -webkit-tap-highlight-color: transparent;
        }
        .dp-back:hover { color: #c8dde8; }
        .dp-topbar-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.1rem; letter-spacing: .06em; color: #c8dde8;
        }

        /* ── STRUKTURA PODZIAŁU 50/50 ── */
        .dp-page {
          flex: 1;
          min-height: 0; 
          width: 96vw; 
          max-width: 1800px;
          margin: 0 auto;
          padding-bottom: 1.5rem;
          position: relative; z-index: 1;
        }

        .dp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr; 
          gap: 3rem;
          height: 100%; 
        }

        /* LEWA STRONA: GALERIA */
        .dp-col-gallery {
          height: 100%;
          display: flex;
          flex-direction: column;
          min-height: 0;
          padding-top: 1rem;
        }
        
        .dp-gallery {
          display: flex; flex-direction: column; gap: 12px;
          height: 100%;
        }

        /* ZDJĘCIE GŁÓWNE */
        .dp-main {
          flex: 1; 
          min-height: 0;
          position: relative; width: 100%; 
          border-radius: 12px; overflow: hidden; background: #0a0d11;
          border: 1px solid rgba(255,255,255,.06);
          box-shadow: 0 8px 40px rgba(0,0,0,.6);
          cursor: zoom-in;
        }
        .dp-main:hover .dp-zoom-hint { opacity: 1; }
        .dp-zoom-hint {
          position: absolute; bottom: 10px; right: 10px; z-index: 10;
          display: flex; align-items: center; gap: 5px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: .55rem; letter-spacing: .2em; text-transform: uppercase;
          color: rgba(255,255,255,.5);
          background: rgba(6,8,10,.7); border: 1px solid rgba(255,255,255,.1);
          padding: .25rem .55rem; border-radius: 4px; backdrop-filter: blur(6px);
          opacity: 0; transition: opacity .2s;
        }
        .dp-arrow {
          position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(6,8,10,.7); border: 1px solid rgba(255,255,255,.1);
          border-radius: 50%; cursor: pointer; color: #c8dde8;
          backdrop-filter: blur(8px); transition: background .2s, border-color .2s;
        }
        .dp-arrow:hover { background: rgba(46,122,181,.4); border-color: rgba(79,163,212,.5); }
        .dp-arrow-l { left: 10px; }
        .dp-arrow-r { right: 10px; }
        .dp-counter { position: absolute; bottom: 10px; left: 10px; z-index: 10; font-family: 'Barlow Condensed', sans-serif; font-size: .58rem; font-weight: 600; letter-spacing: .2em; color: rgba(255,255,255,.5); background: rgba(6,8,10,.65); border: 1px solid rgba(255,255,255,.08); padding: .25rem .6rem; border-radius: 4px; backdrop-filter: blur(6px); }
        .dp-status { position: absolute; top: 10px; left: 10px; z-index: 10; display: inline-flex; align-items: center; gap: 5px; font-family: 'Barlow Condensed', sans-serif; font-size: .58rem; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; padding: .28rem .65rem; border-radius: 4px; background: rgba(6,8,10,.7); backdrop-filter: blur(10px); }
        .dp-dot { width: 5px; height: 5px; border-radius: 50%; animation: dpulse 2s ease-in-out infinite; }
        @keyframes dpulse { 0%,100%{opacity:1}50%{opacity:.3} }

        /* KARUZELA POD ZDJĘCIEM */
        .dp-thumbs {
          flex-shrink: 0;
          height: 60px; 
          display: flex; gap: 7px; overflow-x: auto; padding-bottom: 4px;
        }
        .dp-thumbs::-webkit-scrollbar { display: none; }
        .dp-thumb {
          position: relative; flex-shrink: 0;
          width: 86px; height: 100%; border-radius: 7px; overflow: hidden;
          border: 1.5px solid transparent; opacity: .32; cursor: pointer;
          transition: opacity .2s, border-color .2s;
        }
        .dp-thumb--on { border-color: #6dbf45; opacity: 1; box-shadow: 0 0 8px rgba(109,191,69,.22); }
        .dp-thumb:not(.dp-thumb--on):hover { opacity: .72; }

        /* PRAWA STRONA: TEKSTY I INFO */
        .dp-col-info {
          height: 100%;
          overflow-y: auto; 
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding-right: 1rem; 
          padding-top: 1rem;
        }
        .dp-col-info > * {
          flex-shrink: 0;
        }

        .dp-col-info::-webkit-scrollbar { width: 6px; }
        .dp-col-info::-webkit-scrollbar-track { background: transparent; }
        .dp-col-info::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 4px; }
        .dp-col-info::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,.2); }

        /* ── TYPOGRAFIA I BLOKI ── */
        .dp-header-block { display: flex; flex-direction: column; align-items: flex-start; gap: 0.4rem; }
        
        .dp-eyebrow { margin: 0; font-family: 'Barlow Condensed', sans-serif; font-size: .65rem; font-weight: 600; letter-spacing: .38em; text-transform: uppercase; color: #6dbf45; display: flex; align-items: center; gap: .55rem; }
        .dp-eyebrow::before { content: ''; width: 18px; height: 1px; background: linear-gradient(90deg, #2e7ab5, #6dbf45); flex-shrink: 0; }
        
        .dp-title { 
          margin: 0; 
          font-family: 'Bebas Neue', sans-serif; 
          font-size: clamp(1.8rem, 2.8vw, 2.5rem); 
          line-height: 1.15; 
          letter-spacing: .02em; 
          background: linear-gradient(140deg, #fff 0%, #c8dde8 55%, #5ba3d8 100%); 
          -webkit-background-clip: text; 
          -webkit-text-fill-color: transparent; 
          background-clip: text; 
        }
        
        .dp-year { margin: 0; display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-size: .65rem; letter-spacing: .25em; text-transform: uppercase; color: #3d5565; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-radius: 3px; padding: .2rem .6rem; }
        
        .dp-price-block { padding: 0.7rem 1rem; background: rgba(46,122,181,.08); border: 1px solid rgba(46,122,181,.18); border-radius: 10px; display: flex; align-items: flex-end; gap: .5rem; position: relative; overflow: hidden; }
        .dp-price-block::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(91,163,216,.4), transparent); }
        .dp-price { font-family: 'Bebas Neue', sans-serif; font-size: clamp(1.8rem, 2.5vw, 2.2rem); color: #5ba3d8; line-height: 1; }
        .dp-price-sub { font-family: 'Barlow Condensed', sans-serif; font-size: .6rem; letter-spacing: .26em; text-transform: uppercase; color: #3d5565; padding-bottom: .15rem; }
        .dp-price-hint { margin-left: auto; text-align: right; padding-bottom: .15rem; font-family: 'Barlow Condensed', sans-serif; font-style: italic; font-size: .5rem; letter-spacing: .14em; text-transform: uppercase; color: #2d3e4a; line-height: 1.3; }

        .dp-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
        .dp-stat { display: flex; align-items: center; gap: .6rem; padding: .5rem .7rem; background: rgba(255,255,255,.022); border: 1px solid rgba(255,255,255,.05); border-radius: 9px; }
        .dp-stat-icon { width: 30px; height: 30px; border-radius: 7px; background: rgba(46,122,181,.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .dp-stat-lbl { display: block; font-family: 'Barlow Condensed', sans-serif; font-size: .5rem; letter-spacing: .26em; text-transform: uppercase; color: #3d5565; }
        .dp-stat-val { display: block; font-size: .75rem; font-weight: 500; color: #c8dde8; margin-top: 1px; }

        /* ZGRABNIEJSZY PRZYCISK */
        .dp-cta { position: relative; display: flex; align-items: center; justify-content: center; gap: .6rem; width: 100%; padding: 0.9rem 1.5rem; font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: .8rem; letter-spacing: .2em; text-transform: uppercase; color: #fff; background: none; text-decoration: none; border: 1px solid rgba(109,191,69,.42); clip-path: polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%); overflow: hidden; cursor: pointer; transition: border-color .3s; }
        .dp-cta::before { content: ''; position: absolute; inset: 0; background: linear-gradient(110deg, #2e7ab5 0%, #4a8c2a 100%); opacity: .2; transition: opacity .3s; }
        .dp-cta::after { content: ''; position: absolute; top: 0; left: -100%; bottom: 0; width: 55%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent); transition: left .5s; }
        .dp-cta:hover { border-color: rgba(109,191,69,.85); }
        .dp-cta:hover::before { opacity: .55; }
        .dp-cta:hover::after { left: 155%; }
        .dp-cta span, .dp-cta svg { position: relative; z-index: 1; }

        .dp-unavail { width: 100%; text-align: center; padding: 1rem; font-family: 'Barlow Condensed', sans-serif; font-size: .7rem; letter-spacing: .26em; text-transform: uppercase; color: #2d3e4a; border: 1px dashed rgba(255,255,255,.07); border-radius: 9px; }

        /* Panele Dolne (O pojeździe, Wyposażenie) */
        .dp-panel { background: rgba(12,18,24,.65); border: 1px solid rgba(255,255,255,.055); border-radius: 14px; padding: 1.5rem 2rem; }
        .dp-section-label { font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem; letter-spacing: .08em; color: #c8dde8; margin-bottom: .2rem; }
        .dp-section-label::after { content: ''; display: block; width: 28px; height: 1.5px; margin-top: .3rem; background: linear-gradient(90deg, #2e7ab5, #6dbf45); border-radius: 1px; }
        .dp-desc { font-size: .9rem; font-weight: 300; line-height: 1.8; color: #7c9aac; white-space: pre-line; margin-top: .75rem; }
        .dp-sep { height: 1px; background: rgba(255,255,255,.06); margin: 1.25rem 0; }
        .dp-features { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin-top: .75rem; }
        .dp-feat { display: flex; align-items: center; gap: .6rem; font-size: .8rem; color: #7c9aac; background: rgba(255,255,255,.022); border: 1px solid rgba(255,255,255,.05); border-radius: 7px; padding: .6rem .8rem; }
        
        /* Agent */
        .dp-agent { display: flex; align-items: center; justify-content: space-between; background: rgba(12,18,24,.65); border: 1px solid rgba(255,255,255,.055); border-left: 2px solid #2e7ab5; border-radius: 14px; padding: 1.25rem 2rem; }
        .dp-agent-av { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #2e7ab5, #4a8c2a); display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; color: #fff; flex-shrink: 0; box-shadow: 0 0 0 2px rgba(46,122,181,.18); }
        .dp-agent-lbl { font-family: 'Barlow Condensed', sans-serif; font-size: .55rem; letter-spacing: .3em; text-transform: uppercase; color: #3d5565; }
        .dp-agent-name { font-weight: 500; font-size: .95rem; color: #fff; margin-top: 2px; }
        .dp-agent-phone { font-weight: 300; font-size: .8rem; color: #4fa3d4; margin-top: 3px; }
        .dp-agent-btn { display: flex; align-items: center; justify-content: center; gap: .5rem; padding: .7rem 1.25rem; font-family: 'Barlow Condensed', sans-serif; font-size: .65rem; font-weight: 600; letter-spacing: .22em; text-transform: uppercase; color: #567080; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-radius: 9px; text-decoration: none; transition: background .2s, color .2s, border-color .2s; }
        .dp-agent-btn:hover { background: rgba(46,122,181,.1); border-color: rgba(79,163,212,.28); color: #fff; }

        /* Lightbox */
        .dp-lb { position: fixed; inset: 0; z-index: 9999; background: rgba(2,3,5,.96); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; animation: lbIn .15s ease; }
        @keyframes lbIn { from{opacity:0}to{opacity:1} }
        .dp-lb-close { position: absolute; top: 16px; right: 16px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12); border-radius: 50%; color: #c8dde8; cursor: pointer; transition: background .2s; z-index: 10; }
        .dp-lb-img { position: relative; width: min(90vw, 1200px); height: min(80vh, 750px); border-radius: 10px; overflow: hidden; box-shadow: 0 24px 80px rgba(0,0,0,.8); }
        .dp-lb-arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: rgba(6,8,10,.75); border: 1px solid rgba(255,255,255,.12); border-radius: 50%; color: #c8dde8; cursor: pointer; z-index: 10; backdrop-filter: blur(8px); transition: background .2s, border-color .2s; }
        .dp-lb-arrow-l { left: -56px; }
        .dp-lb-arrow-r { right: -56px; }
        .dp-lb-dots { position: absolute; bottom: -36px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; }
        .dp-lb-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,.25); cursor: pointer; transition: background .2s, transform .2s; }
        .dp-lb-dot--on { background: #fff; transform: scale(1.3); }
        .dp-lb-thumbs { position: absolute; bottom: -84px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; max-width: 90vw; overflow-x: auto; }
        .dp-lb-thumbs::-webkit-scrollbar { display: none; }
        .dp-lb-thumb { position: relative; flex-shrink: 0; width: 56px; height: 38px; border-radius: 5px; overflow: hidden; border: 1.5px solid transparent; opacity: .3; cursor: pointer; transition: opacity .2s, border-color .2s; }
        .dp-lb-thumb--on { border-color: #6dbf45; opacity: 1; }

        /* ═══ RESPONSIVE MOBILE ═══ */
        @media (max-width: 1023px) {
          .dp { 
            height: auto; 
            min-height: 100vh; 
            overflow: visible; 
          }
          .dp-page { 
            width: 100vw; 
            padding: 0 1.25rem 3rem; 
            height: auto; 
          }
          .dp-grid {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }
          .dp-col-gallery { padding-top: 0; }
          .dp-col-info { padding-top: 0; padding-right: 0; overflow-y: visible; }
          
          .dp-main {
            flex: none;
            aspect-ratio: 16 / 9;
          }
          .dp-features { grid-template-columns: 1fr; }
          .dp-agent { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .dp-agent-btn { width: 100%; }
        }
      `}</style>

      {/* Lightbox */}
      {lightbox && (
        <div className="dp-lb" onClick={closeLightbox}>
          <button className="dp-lb-close" onClick={closeLightbox}><X size={16} /></button>
          <div className="dp-lb-img" onClick={e => e.stopPropagation()}>
            <Image src={images[lbIdx]} alt="" fill sizes="90vw" className="object-contain" />
          </div>
          {total > 1 && (
            <>
              <button className="dp-lb-arrow dp-lb-arrow-l" onClick={e => { e.stopPropagation(); lbPrev(); }}><ChevronLeft size={20} /></button>
              <button className="dp-lb-arrow dp-lb-arrow-r" onClick={e => { e.stopPropagation(); lbNext(); }}><ChevronRight size={20} /></button>
              {total <= 6 ? (
                <div className="dp-lb-dots" onClick={e => e.stopPropagation()}>
                  {images.map((_, i) => (
                    <button key={i} className={`dp-lb-dot${lbIdx === i ? ' dp-lb-dot--on' : ''}`} onClick={() => setLbIdx(i)} />
                  ))}
                </div>
              ) : (
                <div className="dp-lb-thumbs" onClick={e => e.stopPropagation()}>
                  {images.map((src, i) => (
                    <button key={i} className={`dp-lb-thumb${lbIdx === i ? ' dp-lb-thumb--on' : ''}`} onClick={() => setLbIdx(i)}>
                      <Image src={src} alt="" fill sizes="56px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── GŁÓWNY WIDOK ── */}
      <div className="dp">
        
        <div className="dp-topbar">
          <button className="dp-back" onClick={() => router.back()}>
            <ArrowLeft size={12} /> Flota
          </button>
          <span style={{ color: 'rgba(255,255,255,.12)' }}>—</span>
          <span className="dp-topbar-title">{car.brand} {car.model}</span>
        </div>

        <div className="dp-page">
          <div className="dp-grid">

            {/* ── LEWA KOLUMNA: GALERIA ── */}
            <div className="dp-col-gallery">
              <div className="dp-gallery">
                
                <div className="dp-main" onClick={() => openLightbox(idx)}>
                  <Image
                    src={images[idx]}
                    alt={`${car.brand} ${car.model}`}
                    fill sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover" priority
                  />
                  <span className="dp-status" style={{ borderColor: sc, color: sc }}>
                    <span className="dp-dot" style={{ background: sc }} />
                    {STATUS_LABEL[car.status] ?? car.status}
                  </span>
                  <span className="dp-zoom-hint"><ZoomIn size={11} /> Powiększ</span>
                  {total > 1 && <span className="dp-counter">{idx + 1} / {total}</span>}
                  {total > 1 && (
                    <>
                      <button className="dp-arrow dp-arrow-l" onClick={e => { e.stopPropagation(); prev(); }}><ChevronLeft size={15} /></button>
                      <button className="dp-arrow dp-arrow-r" onClick={e => { e.stopPropagation(); next(); }}><ChevronRight size={15} /></button>
                    </>
                  )}
                </div>

                {total > 1 && (
                  <div className="dp-thumbs">
                    {images.map((src, i) => (
                      <button key={i} className={`dp-thumb${idx === i ? ' dp-thumb--on' : ''}`} onClick={() => setIdx(i)}>
                        <Image src={src} alt="" fill sizes="86px" className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}

              </div>
            </div>

            {/* ── PRAWA KOLUMNA: TEKSTY ── */}
            <div className="dp-col-info">
              
              <div className="dp-header-block">
                <p className="dp-eyebrow">
                  <span />
                  {car.category}
                </p>
                <h1 className="dp-title">{car.brand}<br />{car.model}</h1>
                <span className="dp-year">{car.year} r.</span>
              </div>

              <div className="dp-price-block">
                <span className="dp-price">{pln(car.price_per_day)}</span>
                <span className="dp-price-sub">/ dobę</span>
                <div className="dp-price-hint">brutto<br />bez kaucji</div>
              </div>

              <div className="dp-stats">
                {[
                  { Icon: Fuel,     label: 'Paliwo',   value: FUEL_LABEL[car.fuel_type] ?? car.fuel_type },
                  { Icon: Settings, label: 'Skrzynia', value: car.gearbox === 'automatyczna' ? 'Automatyczna' : 'Manualna' },
                  { Icon: Users,    label: 'Miejsca',  value: `${car.seats ?? 5}` },
                  { Icon: Calendar, label: 'Przebieg', value: car.mileage ? `${Math.round(car.mileage / 1000)} tys. km` : 'N/D' },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="dp-stat">
                    <div className="dp-stat-icon"><Icon size={14} color="#4fa3d4" /></div>
                    <div>
                      <span className="dp-stat-lbl">{label}</span>
                      <span className="dp-stat-val">{value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {car.status === 'dostepny' ? (
                <button className="dp-cta" onClick={() => router.push(`/cars/${id}/zarezerwuj`)}>
                  <Phone size={14} /><span>Zarezerwuj teraz</span>
                </button>
              ) : (
                <div className="dp-unavail">{STATUS_LABEL[car.status]}</div>
              )}

              {(car.description || car.features?.length) && (
                <div className="dp-panel">
                  {car.description && (
                    <>
                      <h2 className="dp-section-label">O pojeździe</h2>
                      <p className="dp-desc">{car.description.split('\\n').join('\n')}</p>
                    </>
                  )}
                  {car.description && car.features?.length ? <div className="dp-sep" /> : null}
                  {car.features?.length && (
                    <>
                      <h2 className="dp-section-label">Wyposażenie</h2>
                      <ul className="dp-features">
                        {car.features.map((f, i) => (
                          <li key={i} className="dp-feat">
                            <CheckCircle2 size={13} color="#6dbf45" style={{ flexShrink: 0 }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}

              {car.agent && (
                <div className="dp-agent">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem' }}>
                    <div className="dp-agent-av">
                      {car.agent.first_name?.[0]}{car.agent.last_name?.[0]}
                    </div>
                    <div>
                      <p className="dp-agent-lbl">Twój opiekun oferty</p>
                      <p className="dp-agent-name">{car.agent.first_name} {car.agent.last_name}</p>
                      {car.agent.phone && <p className="dp-agent-phone">{car.agent.phone}</p>}
                    </div>
                  </div>
                  {car.agent.phone && (
                    <a href={`tel:${car.agent.phone}`} className="dp-agent-btn">
                      <Phone size={13} /> Zadzwoń
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