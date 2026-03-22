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
import './reserve.css';

type BlockedRange = { startDate: string; endDate: string };

const MAX_MONTHS_AHEAD = 3;

const pln = (n: number) =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(n);

const formatDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseDateKey = (value: string) => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const addDays = (value: string, days: number) => {
  const date = parseDateKey(value);
  date.setDate(date.getDate() + days);
  return formatDateKey(date);
};

const todayKey = () => formatDateKey(new Date());

const buildDateRange = (start: string, end: string) => {
  const result: string[] = [];
  let cursor = start;
  while (cursor <= end) { result.push(cursor); cursor = addDays(cursor, 1); }
  return result;
};

const hasBlockedBetween = (start: string, end: string, blocked: Set<string>) =>
  buildDateRange(start, end).some(d => blocked.has(d));

const monthLabel = (date: Date) =>
  new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' }).format(date);

const shortWeekdays = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];

function buildMonthGrid(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - firstWeekday);
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    return { key: formatDateKey(date), day: date.getDate(), isCurrentMonth: date.getMonth() === month };
  });
}

function daysCount(start: string, end: string) {
  if (!start || !end) return 0;
  const diff = Math.ceil((parseDateKey(end).getTime() - parseDateKey(start).getTime()) / 86400000);
  return diff > 0 ? diff : 1;
}

function ReservationCalendar({
  monthDate, blockedDates, selectedStart, selectedEnd, onSelect,
}: {
  monthDate: Date; blockedDates: Set<string>;
  selectedStart: string; selectedEnd: string;
  onSelect: (key: string) => void;
}) {
  const today = todayKey();
  return (
    <div className="rv-cal-card">
      <div className="rv-cal-weekdays">
        {shortWeekdays.map(d => <span key={d}>{d}</span>)}
      </div>
      <div className="rv-cal-grid">
        {buildMonthGrid(monthDate).map(day => {
          const blocked = blockedDates.has(day.key);
          const disabled = blocked || day.key < today;
          const inRange = selectedStart && selectedEnd && day.key > selectedStart && day.key < selectedEnd;
          const selected = day.key === selectedStart || day.key === selectedEnd;
          return (
            <button
              key={day.key}
              type="button"
              className={[
                'rv-day',
                !day.isCurrentMonth && 'rv-day--off',
                blocked && 'rv-day--blocked',
                selected && 'rv-day--selected',
                inRange && 'rv-day--range',
              ].filter(Boolean).join(' ')}
              disabled={disabled}
              onClick={() => onSelect(day.key)}
              aria-label={day.key}
            >
              {day.day}
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
  const [mounted, setMounted] = useState(false);

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
    startDate: '', endDate: '', pickupTime: '10:00',
    pickupLocation: 'Warszawa - Centrum',
    returnLocation: 'Warszawa - Centrum',
    notes: '',
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([carsAPI.getById(id), authAPI.getProfile(), reservationsAPI.getBlockedDatesForCar(id)])
      .then(([carData, profileData, ranges]) => { 
        setCar(carData); 
        setProfile(profileData); 
        setBlockedRanges(ranges); 
      })
      .catch(() => setError('Nie udało się załadować danych rezerwacji.'))
      .finally(() => setPageLoading(false));
  }, [id, isAuthenticated]);

  const blockedDates = useMemo(() => {
    const s = new Set<string>();
    blockedRanges.forEach(r => {
      // Wyciągnij część datową z ISO formatu (2026-03-26T00:00:00+00:00 -> 2026-03-26)
      const startKey = r.startDate.split('T')[0];
      const endKey = r.endDate.split('T')[0];
      buildDateRange(startKey, endKey).forEach(d => s.add(d));
    });
    return s;
  }, [blockedRanges]);

  const rentalDays = useMemo(() => daysCount(form.startDate, form.endDate), [form.startDate, form.endDate]);
  const estimatedTotal = useMemo(() => (car ? rentalDays * car.price_per_day : 0), [car, rentalDays]);

  const now = new Date();
  const minMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const maxMonth = new Date(now.getFullYear(), now.getMonth() + MAX_MONTHS_AHEAD, 1);
  const canGoPrev = monthCursor.getTime() > minMonth.getTime();
  const canGoNext = monthCursor.getTime() < maxMonth.getTime();

  const setField = (field: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleCalendarSelect = (dateKey: string) => {
    setError('');
    if (selectionMode === 'start' || !form.startDate) {
      setForm(prev => ({ ...prev, startDate: dateKey, endDate: dateKey }));
      setSelectionMode('end');
      return;
    }
    if (dateKey < form.startDate) {
      setForm(prev => ({ ...prev, startDate: dateKey, endDate: dateKey }));
      setSelectionMode('end');
      return;
    }
    if (hasBlockedBetween(form.startDate, dateKey, blockedDates)) {
      setError('Wybrany zakres zawiera zajęte dni.');
      return;
    }
    setForm(prev => ({ ...prev, endDate: dateKey }));
    setSelectionMode('start');
  };

  const shiftMonth = (dir: -1 | 1) => {
    const candidate = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + dir, 1);
    if (candidate < minMonth || candidate > maxMonth) return;
    setMonthCursor(candidate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) { setError('Wybierz datę odbioru i datę zwrotu.'); return; }
    if (form.pickupTime < '10:00') { setError('Rezerwacja możliwa od godziny 10:00.'); return; }
    if (hasBlockedBetween(form.startDate, form.endDate, blockedDates)) { setError('Ten zakres nachodzi na istniejącą rezerwację.'); return; }
    setSaving(true); setSuccess(''); setError('');
    try {
      await reservationsAPI.create({
        carId: id, startDate: form.startDate, endDate: form.endDate,
        pickupTime: form.pickupTime, pickupLocation: form.pickupLocation,
        returnLocation: form.returnLocation, notes: form.notes || undefined,
      });
      setBlockedRanges(await reservationsAPI.getBlockedDatesForCar(id));
      setSuccess('Rezerwacja została zapisana. Znajdziesz ją na swoim koncie.');
      window.setTimeout(() => router.push('/account'), 1400);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się utworzyć rezerwacji.');
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || pageLoading || authLoading) {
    return (
      <div style={{ background: '#06080a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #4fa3d4', borderTopColor: 'transparent', animation: 'spin .7s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!car || !profile) return null;

  return (
    <div className="rv-page">
      <div className="rv-shell">

        <div className="rv-topbar">
          <button className="rv-back" onClick={() => router.push(`/cars/${id}`)}>
            <ArrowLeft size={11} /> Szczegóły auta
          </button>
          <span className="rv-topbar-sep">—</span>
          <span className="rv-topbar-title">Rezerwacja</span>
        </div>

        <div className="rv-grid">

          {/* ── Left card ── */}
          <div className="rv-card">
            <p className="rv-eyebrow">Rezerwacja</p>
            <h1 className="rv-title">{car.brand} {car.model}</h1>
            <p className="rv-subtitle">
              Wybierz termin, miejsca odbioru i zwrotu. Dane kontaktowe pobierzemy z Twojego profilu.
            </p>
            <div className="rv-profile-note">
              <strong>Rezerwacja dla:</strong>{' '}
              {profile.firstName} {profile.lastName} · {profile.email}
            </div>

            {/* Two-column body */}
            <div className="rv-card-body">

              {/* Calendar column */}
              <div className="rv-cal-col">
                <div className="rv-cal-header">
                  <span className="rv-cal-label">Termin</span>
                  <div className="rv-cal-nav">
                    <button type="button" onClick={() => shiftMonth(-1)} disabled={!canGoPrev} aria-label="Poprzedni miesiąc">
                      <ChevronLeft size={12} />
                    </button>
                    <span className="rv-cal-month">{monthLabel(monthCursor)}</span>
                    <button type="button" onClick={() => shiftMonth(1)} disabled={!canGoNext} aria-label="Następny miesiąc">
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>

                <ReservationCalendar
                  monthDate={monthCursor}
                  blockedDates={blockedDates}
                  selectedStart={form.startDate}
                  selectedEnd={form.endDate}
                  onSelect={handleCalendarSelect}
                />

                <div className="rv-selected">
                  <div
                    className={`rv-selected-box${selectionMode === 'start' ? ' rv-selected-box--active' : ''}`}
                    onClick={() => setSelectionMode('start')}
                  >
                    <small>Odbiór</small>
                    <strong>{form.startDate || '—'}</strong>
                  </div>
                  <div
                    className={`rv-selected-box${selectionMode === 'end' ? ' rv-selected-box--active' : ''}`}
                    onClick={() => setSelectionMode('end')}
                  >
                    <small>Zwrot</small>
                    <strong>{form.endDate || '—'}</strong>
                  </div>
                </div>
              </div>

              {/* Form column */}
              <form className="rv-form-col" onSubmit={handleSubmit}>
                <div className="rv-form-grid">
                  <div className="rv-field">
                    <label className="rv-label">Godzina odbioru</label>
                    <input className="rv-select" type="time" value={form.pickupTime} onChange={e => setField('pickupTime', e.target.value)} min="10:00" required />
                  </div>
                  <div className="rv-field">
                    <p className="rv-field-hint">Zwrot do 19:00 ostatniego dnia.</p>
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
                    <label className="rv-label">Uwagi</label>
                    <textarea className="rv-textarea" value={form.notes} onChange={e => setField('notes', e.target.value)} placeholder="Specjalne wymagania, pytania..." />
                  </div>
                </div>

                {error && <div className="rv-error">{error}</div>}
                {success && <div className="rv-success"><CheckCircle2 size={15} /><div>{success}</div></div>}

                <button type="submit" className="rv-submit" disabled={saving}>
                  <CheckCircle2 size={14} />
                  <span>{saving ? 'Zapisywanie…' : 'Zarezerwuj termin'}</span>
                </button>
              </form>

            </div>
          </div>

          {/* ── Sidebar ── */}
          <aside className="rv-summary">
            <div className="rv-car">
              <Image
                src={car.images?.[0] ?? '/auto.jpg'}
                alt={`${car.brand} ${car.model}`}
                fill sizes="300px" className="object-cover"
              />
            </div>
            <div className="rv-summary-body">
              <div className="rv-summary-kicker">Twoje auto</div>
              <h2 className="rv-summary-title">{car.brand} {car.model}</h2>
              <div className="rv-summary-price">
                <strong>{pln(car.price_per_day)}</strong>
                <span>/ doba</span>
              </div>
              <div className="rv-rows">
                <div className="rv-row"><span>Okres wynajmu</span><strong>{rentalDays > 0 ? `${rentalDays} dni` : '—'}</strong></div>
                <div className="rv-row"><span>Szacunkowy koszt</span><strong>{rentalDays > 0 ? pln(estimatedTotal) : '—'}</strong></div>
                <div className="rv-row"><span>Godzina odbioru</span><strong>{form.pickupTime}</strong></div>
                <div className="rv-row"><span>Zwrot</span><strong>Do 19:00</strong></div>
                <div className="rv-row"><span>Odbiór</span><strong>{form.pickupLocation}</strong></div>
                <div className="rv-row"><span>Zwrot auta</span><strong>{form.returnLocation}</strong></div>
              </div>
              <div className="rv-badges">
                <div className="rv-badge"><CalendarDays size={12} color="#4fa3d4" />Przekreślone dni są już zajęte.</div>
                <div className="rv-badge"><Clock3 size={12} color="#6dbf45" />Rezerwacja blokuje termin natychmiast po zapisaniu.</div>
                <div className="rv-badge"><MapPin size={12} color="#4fa3d4" />Dane kontaktowe pobierane z profilu konta.</div>
                <div className="rv-badge"><ShieldCheck size={12} color="#6dbf45" />Backend waliduje konflikty terminów po stronie serwera.</div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}