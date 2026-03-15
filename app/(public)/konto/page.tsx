'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { reservationsAPI, profileAPI } from '@/lib/api';
import type { Reservation, User } from '@/types';

type ReservationStatus = 'aktywna' | 'zakonczona' | 'anulowana';

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

  useEffect(() => {
    loadReservations();
  }, [userId]);

  const loadReservations = async () => {
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
  };

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
      <div style={{ textAlign: 'center', padding: '2rem', color: '#7a8e9e' }}>
        Ładowanie rezerwacji...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '1rem', 
        background: 'rgba(224,82,82,0.1)', 
        border: '1px solid rgba(224,82,82,0.35)',
        borderRadius: '8px',
        color: '#e05252'
      }}>
        {error}
      </div>
    );
  }

  return (
    <>
      {/* Cancel Confirm Modal */}
      {cancelTarget && (
        <div className="modal-overlay" onClick={() => setCancelTarget(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">⚠️</div>
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
            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            <div className="detail-header">
              <CarInitials brand={selected.car?.brand || ''} model={selected.car?.model || ''} />
              <div>
                <div className="detail-car-name">{selected.car?.brand} {selected.car?.model} <span className="detail-year">{selected.car?.year}</span></div>
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
                <span className="detail-value">{Math.ceil((new Date(selected.end_date).getTime() - new Date(selected.start_date).getTime()) / (1000 * 60 * 60 * 24))} dni</span>
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
          <div className="empty-icon">📋</div>
          <p>Brak rezerwacji do wyświetlenia</p>
        </div>
      ) : (
        <div className="res-list">
          {filtered.map(res => {
            const days = Math.ceil((new Date(res.end_date).getTime() - new Date(res.start_date).getTime()) / (1000 * 60 * 60 * 24));
            return (
            <div key={res.id} className="res-card">
              <div className="res-card-left">
                <CarInitials brand={res.car?.brand || ''} model={res.car?.model || ''} />
                <div className="res-info">
                  <div className="res-car">{res.car?.brand} {res.car?.model} <span className="res-year">{res.car?.year}</span></div>
                  <div className="res-id">{res.id}</div>
                  <div className="res-dates">
                    📅 {formatDate(res.start_date)} &nbsp;→&nbsp; {formatDate(res.end_date)}
                    <span className="res-days">{days} dni</span>
                  </div>
                </div>
              </div>
              <div className="res-card-right">
                <span className="res-badge" style={{ '--bc': statusColor(res.status) } as React.CSSProperties}>
                  {statusLabel(res.status)}
                </span>
                <div className="res-price">{res.total_price.toLocaleString('pl-PL')} zł</div>
                <div className="res-actions">
                  <button className="btn-outline-sm" onClick={() => setSelected(res)}>Szczegóły</button>
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
  const [user, setUser] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwShow, setPwShow] = useState({ current: false, newPw: false, confirm: false });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
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
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <div style={{ textAlign: 'center', padding: '2rem', color: '#7a8e9e' }}>
        Ładowanie profilu...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        padding: '1rem',
        background: 'rgba(224,82,82,0.1)',
        border: '1px solid rgba(224,82,82,0.35)',
        borderRadius: '8px',
        color: '#e05252'
      }}>
        Błąd przy ładowaniu profilu
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
            <button className="btn-edit" onClick={() => { setFormData({...user}); setEditMode(true); }}>
              Edytuj
            </button>
          )}
        </div>

        {saveSuccess && (
          <div className="alert-success">✓ Dane zostały zapisane pomyślnie</div>
        )}

        {editMode && formData ? (
          <form className="profile-form" onSubmit={handleSaveProfile}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Imię</label>
                <input
                  className="form-input"
                  value={formData.firstName || ''}
                  onChange={e => setFormData((p: any) => ({ ...p, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nazwisko</label>
                <input
                  className="form-input"
                  value={formData.lastName || ''}
                  onChange={e => setFormData((p: any) => ({ ...p, lastName: e.target.value }))}
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
                  onChange={e => setFormData((p: any) => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <input
                className="form-input"
                value={formData.bio || ''}
                onChange={e => setFormData((p: any) => ({ ...p, bio: e.target.value }))}
              />
            </div>
            <div className="form-button-row">
              <button type="submit" className="btn-primary" disabled={saveLoading}>
                {saveLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setEditMode(false)}
              >
                Anuluj
              </button>
            </div>
          </form>
        ) : (
          <div>
            <ProfileField label="Imię" value={user.firstName} icon="👤" />
            <ProfileField label="Nazwisko" value={user.lastName} icon="👤" />
            <ProfileField label="E-mail" value={user.email} icon="✉" />
            <ProfileField label="Telefon" value={user.phone || '–'} icon="📞" />
            <ProfileField label="Bio" value={user.bio || '–'} icon="💬" />
          </div>
        )}
      </div>

      {/* Password Card */}
      <div className="profile-section">
        <h3 className="section-title">Zmiana hasła</h3>

        {pwSuccess && (
          <div className="alert-success">✓ Hasło zostało zmienione pomyślnie</div>
        )}
        {pwError && (
          <div className="alert-error">✗ {pwError}</div>
        )}

        <form className="profile-form" onSubmit={handleChangePassword} autoComplete="off">
          {(['current', 'newPw', 'confirm'] as const).map((field) => {
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
                  <button type="button" className="pw-toggle" onClick={() => togglePw(field)}>
                    {pwShow[field] ? '🙈' : '👁'}
                  </button>
                </div>
                {field === 'newPw' && (
                  <div className="form-hint">Minimum 8 znaków</div>
                )}
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

function ProfileField({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <div className="pf-item">
      {icon && <span className="pf-icon">{icon}</span>}
      <div className="pf-content">
        <span className="pf-label">{label}</span>
        <span className="pf-value">{value}</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KontoPage() {
  const router = useRouter();
  const { isAuthenticated, loading, session } = useAuth();
  const [tab, setTab] = useState<'rezerwacje' | 'dane'>('rezerwacje');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#08090b',
      }}>
        <div style={{ fontSize: '1rem', color: '#4fa3d4' }}>Ładowanie…</div>
      </div>
    );
  }

  if (!isAuthenticated || !session) {
    return null;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:ital,wght@0,300;0,600;1,300&family=Barlow:wght@300;400&display=swap');

        :root {
          --blue:       #2e7ab5;
          --blue-light: #4fa3d4;
          --green:      #6dbf45;
          --green-dark: #4e9930;
          --surface:    rgba(14, 18, 24, 0.92);
          --card:       rgba(16, 22, 30, 0.85);
          --border:     rgba(46, 122, 181, 0.15);
          --text:       #dce8f0;
          --text-muted: #7a8e9e;
        }

        .konto-page {
          min-height: 100vh;
          background: #08090b;
          padding: 5.5rem 1rem 3rem;
          position: relative;
          overflow: hidden;
        }

        .konto-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(46,122,181,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46,122,181,0.025) 1px, transparent 1px);
          background-size: 52px 52px;
          pointer-events: none;
          z-index: 0;
        }

        .konto-glow-1 {
          position: fixed;
          top: -10%; left: -10%;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(46,122,181,0.07) 0%, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }

        .konto-glow-2 {
          position: fixed;
          bottom: -15%; right: -5%;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(109,191,69,0.05) 0%, transparent 65%);
          pointer-events: none;
          z-index: 0;
        }

        .konto-inner {
          position: relative;
          z-index: 1;
          max-width: 900px;
          margin: 0 auto;
        }

        /* Header */
        .konto-head {
          margin-bottom: 2rem;
        }

        .konto-eyebrow {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: var(--blue-light);
          margin-bottom: 0.4rem;
        }

        .konto-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2rem, 5vw, 3rem);
          letter-spacing: 0.12em;
          background: linear-gradient(100deg, var(--blue-light) 0%, #c8dde8 45%, var(--green) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          margin: 0 0 0.35rem;
        }

        .konto-subtitle {
          font-family: 'Barlow', sans-serif;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        /* Avatar row */
        .konto-avatar-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px;
          margin-bottom: 1.75rem;
          backdrop-filter: blur(12px);
        }

        .konto-avatar {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--blue) 0%, var(--green-dark) 100%);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.4rem;
          color: #fff;
          flex-shrink: 0;
          box-shadow: 0 0 0 2px rgba(46,122,181,0.35);
        }

        .konto-user-name {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 1.1rem;
          letter-spacing: 0.06em;
          color: var(--text);
        }

        .konto-user-email {
          font-family: 'Barlow', sans-serif;
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        /* Tabs */
        .tabs {
          display: flex;
          gap: 0;
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 1.75rem;
          background: rgba(10, 14, 20, 0.6);
        }

        .tab-btn {
          flex: 1;
          padding: 0.75rem 1rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-muted);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.25s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border-bottom: 2px solid transparent;
        }

        .tab-btn:hover { color: var(--text); background: rgba(46,122,181,0.06); }

        .tab-btn.active {
          color: var(--blue-light);
          background: rgba(46,122,181,0.1);
          border-bottom-color: var(--blue-light);
        }

        /* Filter bar */
        .filter-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }

        .filter-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.9rem;
          border-radius: 20px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: rgba(16, 22, 30, 0.8);
          border: 1px solid rgba(46,122,181,0.18);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-pill:hover { border-color: rgba(46,122,181,0.4); color: var(--text); }
        .filter-pill.active { border-color: var(--blue-light); color: var(--blue-light); background: rgba(46,122,181,0.12); }

        .filter-count {
          font-size: 0.65rem;
          font-weight: 700;
          background: rgba(46,122,181,0.2);
          border-radius: 10px;
          padding: 0.1rem 0.4rem;
        }

        /* Reservation cards */
        .res-list { display: flex; flex-direction: column; gap: 0.85rem; }

        .res-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          backdrop-filter: blur(12px);
          transition: border-color 0.25s, box-shadow 0.25s;
        }

        .res-card:hover {
          border-color: rgba(46,122,181,0.35);
          box-shadow: 0 4px 24px rgba(0,0,0,0.3);
        }

        .res-card-left { display: flex; align-items: center; gap: 1rem; flex: 1; min-width: 0; }
        .res-card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem; flex-shrink: 0; }

        .res-info { min-width: 0; }

        .res-car {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 1rem;
          letter-spacing: 0.06em;
          color: var(--text);
        }

        .res-year {
          font-size: 0.82rem;
          color: var(--text-muted);
          font-weight: 300;
        }

        .res-id {
          font-family: 'Barlow', sans-serif;
          font-size: 0.72rem;
          color: var(--text-muted);
          margin: 1px 0 4px;
        }

        .res-dates {
          font-family: 'Barlow', sans-serif;
          font-size: 0.8rem;
          color: #8fafc4;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .res-days {
          font-size: 0.7rem;
          background: rgba(46,122,181,0.15);
          border-radius: 6px;
          padding: 0.1rem 0.45rem;
          color: var(--blue-light);
          font-family: 'Barlow Condensed', sans-serif;
          letter-spacing: 0.06em;
        }

        .res-price {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.2rem;
          letter-spacing: 0.08em;
          color: var(--green);
        }

        .res-badge {
          display: inline-block;
          padding: 0.18rem 0.65rem;
          border-radius: 6px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--bc);
          background: color-mix(in srgb, var(--bc) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--bc) 30%, transparent);
        }

        .res-actions { display: flex; gap: 0.4rem; margin-top: 0.2rem; }

        /* Buttons */
        .btn-outline-sm {
          padding: 0.3rem 0.75rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          background: transparent;
          border: 1px solid rgba(46,122,181,0.45);
          color: var(--blue-light);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-outline-sm:hover { background: rgba(46,122,181,0.12); border-color: var(--blue-light); }

        .btn-danger-sm {
          padding: 0.3rem 0.75rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          background: transparent;
          border: 1px solid rgba(224,82,82,0.45);
          color: #e05252;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-danger-sm:hover { background: rgba(224,82,82,0.1); border-color: #e05252; }

        .btn-primary {
          padding: 0.55rem 1.4rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          background: linear-gradient(90deg, var(--blue) 0%, var(--green-dark) 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
        }

        .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }

        .btn-ghost {
          padding: 0.55rem 1.2rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          background: transparent;
          border: 1px solid rgba(100,120,140,0.35);
          color: var(--text-muted);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-ghost:hover { border-color: rgba(180,200,220,0.4); color: var(--text); }

        .btn-danger {
          padding: 0.55rem 1.4rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          background: rgba(224,82,82,0.15);
          border: 1px solid rgba(224,82,82,0.6);
          color: #e05252;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-danger:hover { background: rgba(224,82,82,0.25); }

        .btn-full { width: 100%; margin-top: 1rem; }

        .btn-edit {
          padding: 0.3rem 0.9rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          background: transparent;
          border: 1px solid rgba(46,122,181,0.4);
          color: var(--blue-light);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-edit:hover { background: rgba(46,122,181,0.12); }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: fadeIn 0.18s ease;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .modal-box {
          position: relative;
          background: linear-gradient(145deg, #0f1620 0%, #0b1018 100%);
          border: 1px solid rgba(46,122,181,0.3);
          border-radius: 16px;
          padding: 2rem;
          width: 100%;
          max-width: 420px;
          text-align: center;
          box-shadow: 0 24px 80px rgba(0,0,0,0.7);
          animation: slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1);
        }

        .modal-detail {
          max-width: 520px;
          text-align: left;
        }

        @keyframes slideUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .modal-close {
          position: absolute;
          top: 1rem; right: 1rem;
          background: transparent;
          border: 1px solid rgba(100,120,140,0.3);
          color: var(--text-muted);
          border-radius: 6px;
          width: 28px; height: 28px;
          cursor: pointer;
          font-size: 0.7rem;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .modal-close:hover { color: var(--text); border-color: rgba(180,200,220,0.4); }

        .modal-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
        .modal-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.5rem;
          letter-spacing: 0.12em;
          color: var(--text);
          margin: 0 0 0.75rem;
        }
        .modal-desc {
          font-family: 'Barlow', sans-serif;
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }
        .modal-desc strong { color: var(--text); }
        .modal-warn {
          font-family: 'Barlow', sans-serif;
          font-size: 0.75rem;
          color: #c07070;
          margin-bottom: 1.5rem;
        }
        .modal-actions { display: flex; gap: 0.75rem; justify-content: center; }

        .detail-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }

        .detail-car-name {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 1.15rem;
          letter-spacing: 0.05em;
          color: var(--text);
        }

        .detail-year {
          font-weight: 300;
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .detail-res-id {
          font-family: 'Barlow', sans-serif;
          font-size: 0.72rem;
          color: var(--text-muted);
          margin: 2px 0 6px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
          margin-bottom: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .detail-item--full { grid-column: 1 / -1; }

        .detail-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.68rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .detail-value {
          font-family: 'Barlow', sans-serif;
          font-size: 0.9rem;
          color: var(--text);
        }

        .detail-total { padding-top: 0.75rem; border-top: 1px solid var(--border); }

        .detail-total-val {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.4rem;
          letter-spacing: 0.1em;
          color: var(--green);
        }

        /* Profile section */
        .profile-section {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 1.5rem;
          margin-bottom: 1.25rem;
          backdrop-filter: blur(12px);
        }

        .section-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }

        .section-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--blue-light);
          margin: 0 0 1.25rem;
        }

        .section-title-row .section-title { margin: 0; }

        .profile-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .pf-item { display: flex; flex-direction: column; gap: 3px; }

        .pf-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.68rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .pf-value {
          font-family: 'Barlow', sans-serif;
          font-size: 0.9rem;
          color: var(--text);
        }

        /* Forms */
        .profile-form { display: flex; flex-direction: column; gap: 0.85rem; }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; }

        .form-group { display: flex; flex-direction: column; gap: 5px; }

        .form-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .form-input {
          padding: 0.55rem 0.85rem;
          background: rgba(10, 14, 20, 0.7);
          border: 1px solid rgba(46,122,181,0.2);
          border-radius: 8px;
          color: var(--text);
          font-family: 'Barlow', sans-serif;
          font-size: 0.88rem;
          transition: border-color 0.2s;
          outline: none;
          width: 100%;
          box-sizing: border-box;
        }

        .form-input:focus { border-color: rgba(46,122,181,0.55); }
        .form-input--disabled { opacity: 0.45; cursor: not-allowed; }
        .form-input:disabled { opacity: 0.45; cursor: not-allowed; }

        .form-hint {
          font-family: 'Barlow', sans-serif;
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .form-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 0.5rem; }

        .pw-wrapper { position: relative; }
        .pw-wrapper .form-input { padding-right: 2.5rem; }

        .pw-toggle {
          position: absolute;
          right: 0.6rem; top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          padding: 0;
          line-height: 1;
          color: var(--text-muted);
        }

        /* Alerts */
        .alert-success {
          padding: 0.6rem 1rem;
          background: rgba(109,191,69,0.1);
          border: 1px solid rgba(109,191,69,0.35);
          border-radius: 8px;
          color: #6dbf45;
          font-family: 'Barlow', sans-serif;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }

        .alert-error {
          padding: 0.6rem 1rem;
          background: rgba(224,82,82,0.1);
          border: 1px solid rgba(224,82,82,0.35);
          border-radius: 8px;
          color: #e05252;
          font-family: 'Barlow', sans-serif;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }

        /* Empty */
        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-muted);
          font-family: 'Barlow', sans-serif;
        }

        .empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }

        /* Responsive */
        @media (max-width: 600px) {
          .res-card { flex-direction: column; align-items: flex-start; }
          .res-card-right { align-items: flex-start; width: 100%; flex-direction: row; flex-wrap: wrap; }
          .form-row { grid-template-columns: 1fr; }
          .detail-grid { grid-template-columns: 1fr; }
        }
      `}</style>

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
              📋 Moje rezerwacje
            </button>
            <button
              className={`tab-btn${tab === 'dane' ? ' active' : ''}`}
              onClick={() => setTab('dane')}
            >
              👤 Moje dane
            </button>
          </div>

          {tab === 'rezerwacje' ? <ReservationsTab userId={session.id} /> : <ProfileTab userId={session.id} />}
        </div>
      </div>
    </>
  );
}
