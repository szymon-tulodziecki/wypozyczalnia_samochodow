'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { authAPI, carsAPI, reservationsAPI } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import type { Car, User } from '@/types';

type BlockedRange = {
  startDate: string;
  endDate: string;
};

const pln = (n: number) =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(n);

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKey = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const addDays = (value: string, days: number) => {
  const date = parseDateKey(value);
  date.setDate(date.getDate() + days);
  return formatDateKey(date);
};

const todayKey = () => formatDateKey(new Date());

const buildDateRange = (startDate: string, endDate: string) => {
  const result: string[] = [];
  let cursor = startDate;
  while (cursor <= endDate) {
    result.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return result;
};

const hasBlockedBetween = (startDate: string, endDate: string, blockedDates: Set<string>) =>
  buildDateRange(startDate, endDate).some(date => blockedDates.has(date));

const monthLabel = (date: Date) =>
  new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' }).format(date);

const shortWeekdays = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];

function buildMonthGrid(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - firstWeekday);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return {
      key: formatDateKey(date),
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
    };
  });
}

function daysCount(startDate: string, endDate: string) {
  if (!startDate || !endDate) return 0;
  const diff = Math.ceil((parseDateKey(endDate).getTime() - parseDateKey(startDate).getTime()) / 86400000);
  return diff > 0 ? diff : 1;
}

function ReservationCalendar({
  monthDate,
  blockedDates,
  selectedStart,
  selectedEnd,
  onSelect,
}: {
  monthDate: Date;
  blockedDates: Set<string>;
  selectedStart: string;
  selectedEnd: string;
  onSelect: (dateKey: string) => void;
}) {
  const today = todayKey();
  const days = buildMonthGrid(monthDate);

  return (
    <div className="rv-cal-card">
      <div className="rv-cal-head">{monthLabel(monthDate)}</div>
      <div className="rv-cal-weekdays">
        {shortWeekdays.map(day => <span key={day}>{day}</span>)}
      </div>
      <div className="rv-cal-grid">
        {days.map(day => {
          const blocked = blockedDates.has(day.key);
          const disabled = blocked || day.key < today;
          const inRange = selectedStart && selectedEnd && day.key >= selectedStart && day.key <= selectedEnd;
          const selected = day.key === selectedStart || day.key === selectedEnd;

          return (
            <button
              key={day.key}
              type="button"
              className={`rv-day${day.isCurrentMonth ? '' : ' rv-day--off'}${blocked ? ' rv-day--blocked' : ''}${selected ? ' rv-day--selected' : ''}${inRange ? ' rv-day--range' : ''}`}
              disabled={disabled}
              onClick={() => onSelect(day.key)}
              aria-label={day.key}
            >
              <span>{day.day}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ReserveCarPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [car, setCar] = useState<Car | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [blockedRanges, setBlockedRanges] = useState<BlockedRange[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [selectionMode, setSelectionMode] = useState<'start' | 'end'>('start');
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    pickupTime: '10:00',
    pickupLocation: 'Warszawa - Centrum',
    returnLocation: 'Warszawa - Centrum',
    notes: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([
      carsAPI.getById(id),
      authAPI.getProfile(),
      reservationsAPI.getBlockedDatesForCar(id),
    ])
      .then(([carData, profileData, reservationRanges]) => {
        setCar(carData);
        setProfile(profileData);
        setBlockedRanges(reservationRanges);
      })
      .catch(() => {
        setError('Nie udało się załadować danych rezerwacji.');
      })
      .finally(() => setPageLoading(false));
  }, [id, isAuthenticated]);

  const blockedDates = useMemo(() => {
    const dates = new Set<string>();
    blockedRanges.forEach(range => {
      buildDateRange(range.startDate, range.endDate).forEach(date => dates.add(date));
    });
    return dates;
  }, [blockedRanges]);

  const rentalDays = useMemo(() => daysCount(form.startDate, form.endDate), [form.endDate, form.startDate]);
  const estimatedTotal = useMemo(() => (car ? rentalDays * car.price_per_day : 0), [car, rentalDays]);
  const nextMonth = useMemo(() => new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1), [monthCursor]);

  const setField = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCalendarSelect = (dateKey: string) => {
    setError('');

    if (selectionMode === 'start' || !form.startDate) {
      setForm(prev => ({
        ...prev,
        startDate: dateKey,
        endDate: dateKey,
      }));
      setSelectionMode('end');
      return;
    }

    if (dateKey < form.startDate) {
      setForm(prev => ({ ...prev, startDate: dateKey, endDate: dateKey }));
      setSelectionMode('end');
      return;
    }

    if (hasBlockedBetween(form.startDate, dateKey, blockedDates)) {
      setError('Wybrany zakres zawiera dni już zajęte dla tego auta.');
      return;
    }

    setForm(prev => ({ ...prev, endDate: dateKey }));
    setSelectionMode('start');
  };

  const shiftMonth = (direction: -1 | 1) => {
    const candidate = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + direction, 1);
    const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    if (candidate < currentMonth) return;
    setMonthCursor(candidate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.startDate || !form.endDate) {
      setError('Wybierz datę odbioru i datę zwrotu.');
      return;
    }

    if (hasBlockedBetween(form.startDate, form.endDate, blockedDates)) {
      setError('Ten zakres nachodzi na istniejącą rezerwację.');
      return;
    }

    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await reservationsAPI.create({
        carId: id,
        startDate: form.startDate,
        endDate: form.endDate,
        pickupTime: form.pickupTime,
        pickupLocation: form.pickupLocation,
        returnLocation: form.returnLocation,
        notes: form.notes || undefined,
      });

      const updatedBlockedRanges = await reservationsAPI.getBlockedDatesForCar(id);
      setBlockedRanges(updatedBlockedRanges);
      setSuccess('Rezerwacja została zapisana. Znajdziesz ją na swoim koncie.');

      window.setTimeout(() => {
        router.push('/konto');
      }, 1400);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Nie udało się utworzyć rezerwacji.');
    } finally {
      setSaving(false);
    }
  };

  if (pageLoading || authLoading) {
    return (
      <div style={{ background: '#06080a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #4fa3d4', borderTopColor: 'transparent', animation: 'sp .7s linear infinite' }} />
        <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!car || !profile) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:ital,wght@0,300;0,400;0,600;1,400&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .rv-page { min-height: 100vh; background: #06080a; color: #fff; font-family: 'Barlow', sans-serif; position: relative; overflow: hidden; }
        .rv-page::before { content: ''; position: fixed; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(46,122,181,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(46,122,181,.03) 1px, transparent 1px); background-size: 48px 48px; }
        .rv-shell { position: relative; z-index: 1; width: min(1280px, calc(100vw - 40px)); margin: 0 auto; padding: 100px 0 40px; }
        .rv-topbar { display: flex; align-items: center; gap: .75rem; margin-bottom: 1.4rem; color: #567080; }
        .rv-back { display: inline-flex; align-items: center; gap: .42rem; font-family: 'Barlow Condensed', sans-serif; font-size: .62rem; letter-spacing: .28em; text-transform: uppercase; color: inherit; background: none; border: none; cursor: pointer; padding: 0; }
        .rv-back:hover { color: #dce8f0; }
        .rv-topbar-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.08rem; letter-spacing: .08em; color: #c8dde8; }
        .rv-grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(360px, .85fr); gap: 1.5rem; align-items: start; }
        .rv-card, .rv-summary { background: rgba(12,18,24,.72); border: 1px solid rgba(255,255,255,.055); border-radius: 18px; backdrop-filter: blur(18px) saturate(1.2); box-shadow: 0 18px 60px rgba(0,0,0,.34); }
        .rv-card { padding: 1.7rem; }
        .rv-summary { padding: 1.15rem; position: sticky; top: 110px; }
        .rv-eyebrow { margin: 0 0 .55rem; display: flex; align-items: center; gap: .55rem; font-family: 'Barlow Condensed', sans-serif; font-size: .64rem; font-weight: 600; letter-spacing: .35em; text-transform: uppercase; color: #6dbf45; }
        .rv-eyebrow::before { content: ''; width: 18px; height: 1px; background: linear-gradient(90deg, #2e7ab5, #6dbf45); }
        .rv-title { margin: 0; font-family: 'Bebas Neue', sans-serif; font-size: clamp(2rem, 4vw, 2.7rem); line-height: 1; letter-spacing: .04em; background: linear-gradient(140deg, #fff 0%, #c8dde8 54%, #5ba3d8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .rv-subtitle { margin: .7rem 0 0; color: #7c9aac; font-size: .96rem; line-height: 1.8; max-width: 62ch; }
        .rv-profile-note { margin-top: 1rem; padding: .95rem 1rem; border-radius: 12px; background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.05); color: #8ea7b8; font-size: .84rem; line-height: 1.7; }
        .rv-profile-note strong { color: #dce8f0; font-weight: 500; }
        .rv-cal-top { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin: 1.4rem 0 .9rem; }
        .rv-cal-top h2 { margin: 0; font-family: 'Bebas Neue', sans-serif; font-size: 1.45rem; letter-spacing: .08em; color: #c8dde8; }
        .rv-cal-nav { display: flex; gap: .4rem; }
        .rv-cal-nav button { width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(255,255,255,.08); background: rgba(255,255,255,.03); color: #c8dde8; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
        .rv-cal-nav button:disabled { opacity: .28; cursor: not-allowed; }
        .rv-cal-grid-shell { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .rv-cal-card { border-radius: 14px; background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.05); padding: 1rem; }
        .rv-cal-head { font-family: 'Barlow Condensed', sans-serif; font-size: .7rem; font-weight: 600; letter-spacing: .24em; text-transform: uppercase; color: #9eb2c1; margin-bottom: .8rem; }
        .rv-cal-weekdays, .rv-cal-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: .35rem; }
        .rv-cal-weekdays span { text-align: center; font-family: 'Barlow Condensed', sans-serif; font-size: .56rem; letter-spacing: .18em; text-transform: uppercase; color: #516674; padding-bottom: .25rem; }
        .rv-day { position: relative; aspect-ratio: 1; border-radius: 10px; border: 1px solid rgba(255,255,255,.05); background: rgba(255,255,255,.02); color: #dce8f0; font: inherit; cursor: pointer; }
        .rv-day span { position: relative; z-index: 1; }
        .rv-day--off { opacity: .3; }
        .rv-day--blocked { color: #5f7280; text-decoration: line-through; text-decoration-thickness: 2px; text-decoration-color: rgba(224,82,82,.8); cursor: not-allowed; }
        .rv-day--blocked::after { content: ''; position: absolute; left: 18%; right: 18%; top: 50%; height: 1.5px; transform: rotate(-13deg); background: rgba(224,82,82,.85); }
        .rv-day--selected { background: rgba(79,163,212,.18); border-color: rgba(79,163,212,.85); color: #fff; }
        .rv-day--range { background: rgba(109,191,69,.12); border-color: rgba(109,191,69,.32); }
        .rv-day:disabled { cursor: not-allowed; }
        .rv-selected { display: grid; grid-template-columns: 1fr 1fr; gap: .8rem; margin-top: 1rem; }
        .rv-selected-box { padding: .9rem 1rem; border-radius: 12px; background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.05); cursor: pointer; }
        .rv-selected-box--active { border-color: rgba(79,163,212,.85); box-shadow: 0 0 0 2px rgba(46,122,181,.12) inset; }
        .rv-selected-box small { display: block; font-family: 'Barlow Condensed', sans-serif; font-size: .58rem; letter-spacing: .22em; text-transform: uppercase; color: #516674; margin-bottom: .35rem; }
        .rv-selected-box strong { color: #dce8f0; font-size: .95rem; }
        .rv-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.2rem; }
        .rv-field, .rv-field-wide { display: flex; flex-direction: column; gap: .4rem; }
        .rv-field-wide { grid-column: 1 / -1; }
        .rv-label { font-family: 'Barlow Condensed', sans-serif; font-size: .64rem; font-weight: 600; letter-spacing: .24em; text-transform: uppercase; color: #94aab8; }
        .rv-select, .rv-textarea { width: 100%; border: 1px solid rgba(255,255,255,.09); background: rgba(6,8,10,.76); color: #dce8f0; border-radius: 12px; padding: .9rem 1rem; outline: none; transition: border-color .2s, box-shadow .2s, background .2s; font: inherit; }
        .rv-select:focus, .rv-textarea:focus { border-color: rgba(79,163,212,.75); box-shadow: 0 0 0 3px rgba(46,122,181,.12); background: rgba(6,8,10,.9); }
        .rv-textarea { min-height: 124px; resize: vertical; }
        .rv-error, .rv-success { margin-top: 1rem; padding: .95rem 1rem; border-radius: 12px; font-size: .88rem; }
        .rv-error { background: rgba(224,82,82,.08); border: 1px solid rgba(224,82,82,.2); color: #f0b8b8; }
        .rv-success { display: flex; align-items: flex-start; gap: .7rem; background: rgba(109,191,69,.08); border: 1px solid rgba(109,191,69,.2); color: #cfeabf; }
        .rv-submit { margin-top: 1.4rem; position: relative; display: inline-flex; align-items: center; justify-content: center; gap: .65rem; width: 100%; padding: 1rem 1.25rem; font-family: 'Barlow Condensed', sans-serif; font-size: .78rem; font-weight: 600; letter-spacing: .22em; text-transform: uppercase; color: #fff; border: 1px solid rgba(109,191,69,.48); background: none; clip-path: polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%); overflow: hidden; cursor: pointer; }
        .rv-submit::before { content: ''; position: absolute; inset: 0; background: linear-gradient(110deg, #2e7ab5 0%, #4a8c2a 100%); opacity: .26; transition: opacity .25s; }
        .rv-submit span, .rv-submit svg { position: relative; z-index: 1; }
        .rv-submit:hover::before { opacity: .52; }
        .rv-submit:disabled { opacity: .55; cursor: not-allowed; }
        .rv-summary { overflow: hidden; }
        .rv-car { position: relative; overflow: hidden; border-radius: 14px; border: 1px solid rgba(255,255,255,.06); background: #0a0d11; aspect-ratio: 16 / 10; }
        .rv-summary-body { padding: 1rem .1rem .1rem; }
        .rv-summary-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; letter-spacing: .05em; color: #f6fbff; margin: .15rem 0 0; }
        .rv-summary-kicker { font-family: 'Barlow Condensed', sans-serif; font-size: .6rem; letter-spacing: .28em; text-transform: uppercase; color: #6dbf45; }
        .rv-summary-price { display: flex; align-items: baseline; gap: .45rem; margin: 1rem 0; padding: .8rem .95rem; background: rgba(46,122,181,.08); border: 1px solid rgba(46,122,181,.16); border-radius: 12px; }
        .rv-summary-price strong { font-family: 'Bebas Neue', sans-serif; font-size: 2rem; line-height: 1; color: #5ba3d8; font-weight: 400; }
        .rv-summary-price span { font-family: 'Barlow Condensed', sans-serif; font-size: .62rem; letter-spacing: .24em; text-transform: uppercase; color: #3d5565; }
        .rv-rows { display: grid; gap: .65rem; }
        .rv-row { display: flex; justify-content: space-between; gap: 1rem; color: #8ea7b8; font-size: .88rem; padding-bottom: .65rem; border-bottom: 1px solid rgba(255,255,255,.05); }
        .rv-row strong { color: #dce8f0; font-weight: 500; }
        .rv-badges { display: grid; gap: .6rem; margin-top: 1rem; }
        .rv-badge { display: flex; align-items: center; gap: .65rem; padding: .8rem .9rem; border-radius: 12px; background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.05); color: #8ea7b8; font-size: .82rem; }
        @media (max-width: 980px) { .rv-shell { width: calc(100vw - 28px); padding-top: 92px; } .rv-grid, .rv-cal-grid-shell, .rv-selected, .rv-form-grid { grid-template-columns: 1fr; } .rv-summary { position: static; } }
      `}</style>

      <div className="rv-page">
        <div className="rv-shell">
          <div className="rv-topbar">
            <button className="rv-back" onClick={() => router.push(`/cars/${id}`)}>
              <ArrowLeft size={12} /> Szczegóły auta
            </button>
            <span style={{ color: 'rgba(255,255,255,.12)' }}>—</span>
            <span className="rv-topbar-title">Rezerwacja</span>
          </div>

          <div className="rv-grid">
            <div className="rv-card">
              <p className="rv-eyebrow">Rezerwacja premium</p>
              <h1 className="rv-title">Zarezerwuj {car.brand} {car.model}</h1>
              <p className="rv-subtitle">
                Dane kontaktowe i identyfikacyjne pobierzemy automatycznie z Twojego profilu.
                Tutaj wybierasz tylko termin, miejsca odbioru i zwrotu oraz dodatkowe uwagi.
              </p>

              <div className="rv-profile-note">
                <strong>Rezerwacja zostanie przypisana do:</strong><br />
                {profile.firstName} {profile.lastName} · {profile.email}
              </div>

              <div className="rv-cal-top">
                <h2>Wybierz termin</h2>
                <div className="rv-cal-nav">
                  <button type="button" onClick={() => shiftMonth(-1)} disabled={monthCursor <= new Date(new Date().getFullYear(), new Date().getMonth(), 1)}>
                    <ChevronLeft size={16} />
                  </button>
                  <button type="button" onClick={() => shiftMonth(1)}>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="rv-cal-grid-shell">
                <ReservationCalendar monthDate={monthCursor} blockedDates={blockedDates} selectedStart={form.startDate} selectedEnd={form.endDate} onSelect={handleCalendarSelect} />
                <ReservationCalendar monthDate={nextMonth} blockedDates={blockedDates} selectedStart={form.startDate} selectedEnd={form.endDate} onSelect={handleCalendarSelect} />
              </div>

              <div className="rv-selected">
                <div className={`rv-selected-box${selectionMode === 'start' ? ' rv-selected-box--active' : ''}`} onClick={() => setSelectionMode('start')}>
                  <small>Data odbioru</small>
                  <strong>{form.startDate || 'Nie wybrano'}</strong>
                </div>
                <div className={`rv-selected-box${selectionMode === 'end' ? ' rv-selected-box--active' : ''}`} onClick={() => setSelectionMode('end')}>
                  <small>Data zwrotu</small>
                  <strong>{form.endDate || 'Nie wybrano'}</strong>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="rv-form-grid">
                  <div className="rv-field">
                    <label className="rv-label">Godzina odbioru</label>
                    <input className="rv-select" type="time" value={form.pickupTime} onChange={e => setField('pickupTime', e.target.value)} required />
                  </div>
                  <div className="rv-field" style={{ alignSelf: 'end', color: '#8ea7b8', fontSize: '.82rem', lineHeight: 1.6 }}>
                    Zwrot auta musi nastąpić do 19:00 w ostatnim dniu rezerwacji.
                  </div>
                  <div className="rv-field">
                    <label className="rv-label">Miejsce odbioru</label>
                    <select className="rv-select" value={form.pickupLocation} onChange={e => setField('pickupLocation', e.target.value)}>
                      <option>Warszawa - Centrum</option>
                      <option>Warszawa - Lotnisko Chopina</option>
                      <option>Kraków - Centrum</option>
                      <option>Wrocław - Centrum</option>
                    </select>
                  </div>
                  <div className="rv-field">
                    <label className="rv-label">Miejsce zwrotu</label>
                    <select className="rv-select" value={form.returnLocation} onChange={e => setField('returnLocation', e.target.value)}>
                      <option>Warszawa - Centrum</option>
                      <option>Warszawa - Lotnisko Chopina</option>
                      <option>Kraków - Centrum</option>
                      <option>Wrocław - Centrum</option>
                    </select>
                  </div>
                  <div className="rv-field-wide">
                    <label className="rv-label">Uwagi do rezerwacji</label>
                    <textarea className="rv-textarea" value={form.notes} onChange={e => setField('notes', e.target.value)} placeholder="Godzina odbioru, specjalne wymagania, pytania o podstawienie..." />
                  </div>
                </div>

                {error && <div className="rv-error">{error}</div>}
                {success && <div className="rv-success"><CheckCircle2 size={18} /><div>{success}</div></div>}

                <button type="submit" className="rv-submit" disabled={saving}>
                  <CheckCircle2 size={16} />
                  <span>{saving ? 'Zapisywanie rezerwacji' : 'Zarezerwuj termin'}</span>
                </button>
              </form>
            </div>

            <aside className="rv-summary">
              <div className="rv-car">
                <Image src={car.images?.[0] ?? '/auto.jpg'} alt={`${car.brand} ${car.model}`} fill sizes="(max-width: 980px) 100vw, 420px" className="object-cover" />
              </div>
              <div className="rv-summary-body">
                <div className="rv-summary-kicker">Twoje auto</div>
                <h2 className="rv-summary-title">{car.brand} {car.model}</h2>
                <div className="rv-summary-price"><strong>{pln(car.price_per_day)}</strong><span>/ doba</span></div>
                <div className="rv-rows">
                  <div className="rv-row"><span>Okres wynajmu</span><strong>{rentalDays > 0 ? `${rentalDays} dni` : '—'}</strong></div>
                  <div className="rv-row"><span>Szacunkowy koszt</span><strong>{rentalDays > 0 ? pln(estimatedTotal) : '—'}</strong></div>
                  <div className="rv-row"><span>Godzina odbioru</span><strong>{form.pickupTime}</strong></div>
                  <div className="rv-row"><span>Zwrot auta</span><strong>Do 19:00 ostatniego dnia</strong></div>
                  <div className="rv-row"><span>Odbiór</span><strong>{form.pickupLocation}</strong></div>
                  <div className="rv-row"><span>Zwrot</span><strong>{form.returnLocation}</strong></div>
                </div>
                <div className="rv-badges">
                  <div className="rv-badge"><CalendarDays size={15} color="#4fa3d4" /> Przekreślone dni oznaczają terminy już zajęte przez inne rezerwacje.</div>
                  <div className="rv-badge"><Clock3 size={15} color="#6dbf45" /> Rezerwacja zapisuje wybrany zakres i od razu blokuje go dla kolejnych klientów.</div>
                  <div className="rv-badge"><MapPin size={15} color="#4fa3d4" /> Dane użytkownika są pobierane bezpośrednio z Twojego profilu konta.</div>
                  <div className="rv-badge"><ShieldCheck size={15} color="#6dbf45" /> Logika backendowa jest już podpięta do zapisu rezerwacji i walidacji konfliktów terminów.</div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}