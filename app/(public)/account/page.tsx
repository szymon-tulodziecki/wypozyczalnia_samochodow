'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { reservationsAPI, profileAPI } from '@/lib/api';
import type { Reservation, User } from '@/types';
import './konto.css';

type ReservationStatus = 'aktywna' | 'zakonczona' | 'anulowana';
type ProfileFormData = {
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function statusLabel(s: ReservationStatus) {
  if (s === 'aktywna') return 'Aktywna';
  if (s === 'zakonczona') return 'Zakończona';
  return 'Anulowana';
}

function statusColor(s: ReservationStatus) {
  if (s === 'aktywna') return '#6dbf45';
  if (s === 'zakonczona') return '#4fa3d4';
  return '#e05252';
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconCalendar() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="14" height="12" rx="2" />
      <path d="M1 7h14M5 1v4M11 1v4" />
    </svg>
  );
}

function IconWarning() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e0a052" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconEye({ visible }: { visible: boolean }) {
  return visible ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2 8 6 12 14 4" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="2" y1="2" x2="14" y2="14" />
      <line x1="14" y1="2" x2="2" y2="14" />
    </svg>
  );
}

function IconReservations() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
      <line x1="8" y1="9" x2="10" y2="9" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CarInitials({ brand, model }: { brand: string; model: string }) {
  const initials = (brand[0] + model[0]).toUpperCase();
  return (
    <div style={{
      width: 72, height: 72, borderRadius: 12, flexShrink: 0,
      background: 'linear-gradient(135deg, rgba(46,122,181,0.15), rgba(109,191,69,0.1))',
      border: '1px solid rgba(46,122,181,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: '1.5rem',
      color: '#4fa3d4',
      letterSpacing: '0.06em',
    }}>
      {initials}
    </div>
  );
}

// ─── Reservations Tab ─────────────────────────────────────────────────────────

function ReservationsTab({ userId }: { userId: string }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [filter, setFilter] = useState<'wszystkie' | 'aktywna' | 'zakonczona' | 'anulowana'>('wszystkie');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await reservationsAPI.getUserReservations(userId);
      setReservations(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Błąd przy ładowaniu rezerwacji';
      console.error('Failed to load reservations:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadReservations();
  }, [loadReservations]);

  const filtered = filter === 'wszystkie' ? reservations : reservations.filter(r => r.status === filter);

  const handleCancel = async (res: Reservation) => {
    try {
      await reservationsAPI.cancel(res.id);
      setReservations(prev =>
        prev.map(r => r.id === res.id ? { ...r, status: 'anulowana' } : r)
      );
      setCancelTarget(null);
      if (selected?.id === res.id) setSelected({ ...res, status: 'anulowana' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nie udało się anulować rezerwacji';
      console.error('Failed to cancel reservation:', message);
      alert(message);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#7a8e9e', fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem' }}>
        Ładowanie rezerwacji…
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-error">
        <IconX /> {error}
      </div>
    );
  }

  return (
    <>
      {/* Cancel Confirm Modal */}
      {cancelTarget && (
        <div className="modal-overlay" onClick={() => setCancelTarget(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon-wrap"><IconWarning /></div>
            <h3 className="modal-title">Anulować rezerwację?</h3>
            <p className="modal-desc">
              <strong>{cancelTarget.car?.brand} {cancelTarget.car?.model}</strong><br />
              {formatDate(cancelTarget.start_date)} – {formatDate(cancelTarget.end_date)}
            </p>
            <p className="modal-warn">Tej operacji nie można cofnąć.</p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setCancelTarget(null)}>Wróć</button>
              <button className="btn-danger" onClick={() => handleCancel(cancelTarget)}>Tak, anuluj</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box modal-detail" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="Zamknij">
              <IconX />
            </button>
            <div className="detail-header">
              <CarInitials brand={selected.car?.brand || ''} model={selected.car?.model || ''} />
              <div>
                <div className="detail-car-name">
                  {selected.car?.brand} {selected.car?.model}{' '}
                  <span className="detail-year">{selected.car?.year}</span>
                </div>
                <div className="detail-res-id">{selected.id}</div>
                <span className="res-badge" style={{ '--bc': statusColor(selected.status) } as React.CSSProperties}>
                  {statusLabel(selected.status)}
                </span>
              </div>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Data odbioru</span>
                <span className="detail-value">{formatDate(selected.start_date)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Data zwrotu</span>
                <span className="detail-value">{formatDate(selected.end_date)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Liczba dni</span>
                <span className="detail-value">
                  {Math.ceil((new Date(selected.end_date).getTime() - new Date(selected.start_date).getTime()) / (1000 * 60 * 60 * 24))} dni
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Cena za dzień</span>
                <span className="detail-value">{selected.car?.price_per_day} zł</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Miejsce odbioru</span>
                <span className="detail-value">{selected.pickup_location || 'Brak informacji'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Godzina odbioru</span>
                <span className="detail-value">{selected.pickup_time || 'Brak informacji'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Miejsce zwrotu</span>
                <span className="detail-value">{selected.return_location || 'Brak informacji'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Zwrot auta</span>
                <span className="detail-value">Do 19:00 ostatniego dnia</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Data rezerwacji</span>
                <span className="detail-value">{formatDate(selected.created_at)}</span>
              </div>
              <div className="detail-item detail-item--full detail-total">
                <span className="detail-label">Łączny koszt</span>
                <span className="detail-value detail-total-val">{selected.total_price.toLocaleString('pl-PL')} zł</span>
              </div>
            </div>

            {selected.status === 'aktywna' && (
              <button
                className="btn-danger btn-full"
                onClick={() => { setSelected(null); setCancelTarget(selected); }}
              >
                Anuluj rezerwację
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="filter-bar">
        {(['wszystkie', 'aktywna', 'zakonczona', 'anulowana'] as const).map(f => (
          <button
            key={f}
            className={`filter-pill${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'wszystkie' ? 'Wszystkie' : statusLabel(f)}
            <span className="filter-count">
              {f === 'wszystkie' ? reservations.length : reservations.filter(r => r.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-rule" />
          <p className="empty-text">Brak rezerwacji do wyświetlenia</p>
        </div>
      ) : (
        <div className="res-list">
          {filtered.map(res => {
            const days = Math.ceil(
              (new Date(res.end_date).getTime() - new Date(res.start_date).getTime()) / (1000 * 60 * 60 * 24)
            );
            return (
              <div key={res.id} className="res-card">
                <div className="res-card-left">
                  <CarInitials brand={res.car?.brand || ''} model={res.car?.model || ''} />
                  <div className="res-info">
                    <div className="res-car">
                      {res.car?.brand} {res.car?.model}{' '}
                      <span className="res-year">{res.car?.year}</span>
                    </div>
                    <div className="res-id">{res.id}</div>
                    <div className="res-dates">
                      <span className="res-dates-icon"><IconCalendar /></span>
                      {formatDate(res.start_date)}&nbsp;&rarr;&nbsp;{formatDate(res.end_date)}
                      <span className="res-days">{days}&nbsp;dni</span>
                    </div>
                  </div>
                </div>
                <div className="res-card-right">
                  <span className="res-badge" style={{ '--bc': statusColor(res.status) } as React.CSSProperties}>
                    {statusLabel(res.status)}
                  </span>
                  <div className="res-price">{res.total_price.toLocaleString('pl-PL')} zł</div>
                  <div className="res-actions">
                    <Link href={`/account/rezerwacja/${res.id}`} className="btn-outline-sm">Szczegóły</Link>
                    {res.status === 'aktywna' && (
                      <button className="btn-danger-sm" onClick={() => setCancelTarget(res)}>Anuluj</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwShow, setPwShow] = useState({ current: false, newPw: false, confirm: false });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await profileAPI.getFullProfile(userId);
      setUser(data);
      setFormData({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || '',
        bio: data.bio || '',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    try {
      setSaveLoading(true);
      const updated = await profileAPI.updateProfile(userId, formData);
      setUser(updated);
      setEditMode(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Nie udało się zapisać zmian');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.current !== '••••••••') {
      setPwError('Obecne hasło jest nieprawidłowe');
      return;
    }
    if (pwForm.newPw.length < 8) {
      setPwError('Nowe hasło musi mieć co najmniej 8 znaków');
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      setPwError('Hasła nie są zgodne');
      return;
    }
    setPwSuccess(true);
    setPwForm({ current: '', newPw: '', confirm: '' });
    setTimeout(() => setPwSuccess(false), 3500);
  };

  const togglePw = (field: keyof typeof pwShow) =>
    setPwShow(prev => ({ ...prev, [field]: !prev[field] }));

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#7a8e9e', fontFamily: "'Barlow', sans-serif", fontSize: '0.875rem' }}>
        Ładowanie profilu…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="alert-error">
        <IconX /> Błąd przy ładowaniu profilu
      </div>
    );
  }

  return (
    <>
      {/* Profile Card */}
      <div className="profile-section">
        <div className="section-title-row">
          <h3 className="section-title">Dane osobowe</h3>
          {!editMode && (
            <button
              className="btn-edit"
              onClick={() => {
                setFormData({
                  firstName: user.firstName,
                  lastName: user.lastName,
                  phone: user.phone || '',
                  bio: user.bio || '',
                });
                setEditMode(true);
              }}
            >
              Edytuj
            </button>
          )}
        </div>

        {saveSuccess && (
          <div className="alert-success">
            <IconCheck /> Dane zostały zapisane pomyślnie
          </div>
        )}

        {editMode && formData ? (
          <form className="profile-form" onSubmit={handleSaveProfile}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Imię</label>
                <input
                  className="form-input"
                  value={formData.firstName || ''}
                  onChange={e => setFormData(p => (p ? { ...p, firstName: e.target.value } : p))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nazwisko</label>
                <input
                  className="form-input"
                  value={formData.lastName || ''}
                  onChange={e => setFormData(p => (p ? { ...p, lastName: e.target.value } : p))}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Adres e-mail</label>
              <input
                className="form-input form-input--disabled"
                value={user.email}
                disabled
                title="E-mail nie może być zmieniany"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Telefon</label>
                <input
                  className="form-input"
                  value={formData.phone || ''}
                  onChange={e => setFormData(p => (p ? { ...p, phone: e.target.value } : p))}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <input
                className="form-input"
                value={formData.bio || ''}
                onChange={e => setFormData(p => (p ? { ...p, bio: e.target.value } : p))}
              />
            </div>
            <div className="form-button-row">
              <button type="submit" className="btn-primary" disabled={saveLoading}>
                {saveLoading ? 'Zapisywanie…' : 'Zapisz zmiany'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setEditMode(false)}>
                Anuluj
              </button>
            </div>
          </form>
        ) : (
          <div className="pf-grid">
            <ProfileField label="Imię" value={user.firstName} />
            <ProfileField label="Nazwisko" value={user.lastName} />
            <ProfileField label="E-mail" value={user.email} />
            <ProfileField label="Telefon" value={user.phone || '–'} />
            <ProfileField label="Bio" value={user.bio || '–'} wide />
          </div>
        )}
      </div>

      {/* Password Card */}
      <div className="profile-section">
        <h3 className="section-title">Zmiana hasła</h3>

        {pwSuccess && (
          <div className="alert-success">
            <IconCheck /> Hasło zostało zmienione pomyślnie
          </div>
        )}
        {pwError && (
          <div className="alert-error">
            <IconX /> {pwError}
          </div>
        )}

        <form className="profile-form" onSubmit={handleChangePassword} autoComplete="off">
          {(['current', 'newPw', 'confirm'] as const).map(field => {
            const labels = { current: 'Obecne hasło', newPw: 'Nowe hasło', confirm: 'Potwierdź nowe hasło' };
            return (
              <div key={field} className="form-group">
                <label className="form-label">{labels[field]}</label>
                <div className="pw-wrapper">
                  <input
                    className="form-input"
                    type={pwShow[field] ? 'text' : 'password'}
                    value={pwForm[field]}
                    onChange={e => { setPwError(''); setPwForm(p => ({ ...p, [field]: e.target.value })); }}
                    required
                    autoComplete={field === 'current' ? 'current-password' : 'new-password'}
                  />
                  <button type="button" className="pw-toggle" onClick={() => togglePw(field)} aria-label={pwShow[field] ? 'Ukryj hasło' : 'Pokaż hasło'}>
                    <IconEye visible={pwShow[field]} />
                  </button>
                </div>
                {field === 'newPw' && <div className="form-hint">Minimum 8 znaków</div>}
              </div>
            );
          })}
          <div className="form-actions">
            <button type="submit" className="btn-primary">Zmień hasło</button>
          </div>
        </form>
      </div>
    </>
  );
}

function ProfileField({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`pf-item${wide ? ' pf-item--wide' : ''}`}>
      <span className="pf-label">{label}</span>
      <span className="pf-value">{value}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KontoPage() {
  const router = useRouter();
  const { isAuthenticated, loading, session } = useAuth();
  const [tab, setTab] = useState<'rezerwacje' | 'dane'>('rezerwacje');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (!mounted) return null;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#08090b',
      }}>
        <div style={{ fontSize: '0.9rem', color: '#4fa3d4', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Ładowanie…
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !session) return null;

  return (
    <div className="konto-page">
      <div className="konto-glow-1" />
      <div className="konto-glow-2" />

      <div className="konto-inner">
          <div className="konto-head">
            <div className="konto-eyebrow">Panel klienta</div>
            <h1 className="konto-title">Moje konto</h1>
            <p className="konto-subtitle">Zarządzaj swoimi rezerwacjami i danymi osobowymi</p>
          </div>

          <div className="konto-avatar-row">
            <div className="konto-avatar">
              {session.firstName[0]}{session.lastName[0]}
            </div>
            <div>
              <div className="konto-user-name">{session.firstName} {session.lastName}</div>
              <div className="konto-user-email">{session.email}</div>
            </div>
          </div>

          <div className="tabs">
            <button
              className={`tab-btn${tab === 'rezerwacje' ? ' active' : ''}`}
              onClick={() => setTab('rezerwacje')}
            >
              <IconReservations />
              Moje rezerwacje
            </button>
            <button
              className={`tab-btn${tab === 'dane' ? ' active' : ''}`}
              onClick={() => setTab('dane')}
            >
              <IconUser />
              Moje dane
            </button>
          </div>

          {tab === 'rezerwacje'
            ? <ReservationsTab userId={session.id} />
            : <ProfileTab userId={session.id} />
          }
        </div>
      </div>
  );
}