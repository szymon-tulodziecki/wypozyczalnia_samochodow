'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { authAPI, reservationsAPI } from '@/lib/api';
import type { Reservation } from '@/types';
import '../../konto.css';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function statusLabel(status: Reservation['status']) {
  if (status === 'aktywna') return 'Aktywna';
  if (status === 'zakonczona') return 'Zakończona';
  return 'Anulowana';
}

export default function ReservationDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    const fetch = async () => {
      try {
        setLoading(true);
        const profile = await authAPI.getProfile();
        const list = await reservationsAPI.getUserReservations(profile.id);
        const found = list.find(r => r.id === id);
        if (!found) {
          setError('Nie znaleziono rezerwacji.');
        } else {
          setReservation(found);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Błąd odczytu rezerwacji.');
      } finally {
        setLoading(false);
      }
    };

    void fetch();
  }, [id, router, isAuthenticated, authLoading]);

  if (authLoading || loading) {
    return <div className="alert-info">Ładowanie danych rezerwacji…</div>;
  }

  if (error) {
    return (
      <div className="konto-page">
        <div className="page-inner">
          <div className="alert-error">{error}</div>
          <Link href="/konto" className="btn-outline-sm">Wróć do listy rezerwacji</Link>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return null;
  }

  const days = Math.ceil((new Date(reservation.end_date).getTime() - new Date(reservation.start_date).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="konto-page">
      <div className="page-inner">
        <h1>Szczegóły rezerwacji</h1>
        <p className="subtitle">Rezerwacja ID: {reservation.id}</p>

        <section className="detail-card">
          <div className="detail-row"><strong>Status:</strong> {statusLabel(reservation.status)}</div>
          <div className="detail-row"><strong>Auto:</strong> {reservation.car?.brand} {reservation.car?.model} ({reservation.car?.year})</div>
          <div className="detail-row"><strong>Terminy:</strong> {formatDate(reservation.start_date)} – {formatDate(reservation.end_date)} ({days} dni)</div>
          <div className="detail-row"><strong>Cena za dzień:</strong> {reservation.car ? `${reservation.car.price_per_day} zł` : '—'}</div>
          <div className="detail-row"><strong>Łączny koszt:</strong> {reservation.total_price.toLocaleString('pl-PL')} zł</div>
          <div className="detail-row"><strong>Odbiór:</strong> {reservation.pickup_time || '—'}, {reservation.pickup_location || '—'}</div>
          <div className="detail-row"><strong>Zwrot:</strong> {reservation.return_location || '—'}</div>
          <div className="detail-row"><strong>Uwagi:</strong> {reservation.notes || 'Brak'}</div>
        </section>

        <div className="actions-row">
          <Link href="/konto" className="btn-outline-sm">Wróć do konta</Link>
          {reservation.status === 'aktywna' && (
            <button className="btn-danger-sm" onClick={async () => {
              try {
                await reservationsAPI.cancel(reservation.id);
                router.refresh();
              } catch (err) {
                alert(err instanceof Error ? err.message : 'Błąd przy anulowaniu.');
              }
            }}>
              Anuluj rezerwację
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
