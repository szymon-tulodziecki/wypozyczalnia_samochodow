'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, CarFront, MapPin, Pencil, Plus, RefreshCw, Trash2, UserRound } from 'lucide-react';
import { reservationsAPI } from '@/lib/api';
import type { Reservation } from '@/types';

type ReservationStatus = Reservation['status'] | 'wszystkie';

const STATUS_LABEL: Record<Reservation['status'], string> = {
  aktywna: 'Aktywna',
  zakonczona: 'Zakończona',
  anulowana: 'Anulowana',
};

const STATUS_CLASS: Record<Reservation['status'], string> = {
  aktywna: 'bg-green-100 text-green-700',
  zakonczona: 'bg-blue-100 text-blue-700',
  anulowana: 'bg-red-100 text-red-700',
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filter, setFilter] = useState<ReservationStatus>('wszystkie');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await reservationsAPI.getAllAdmin();
      setReservations(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Nie udało się pobrać rezerwacji.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmId(null);
    setDeletingId(id);
    try {
      await reservationsAPI.deleteAdmin(id);
      setReservations(prev => prev.filter(reservation => reservation.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Nie udało się usunąć rezerwacji.');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const filteredReservations = useMemo(() => {
    if (filter === 'wszystkie') return reservations;
    return reservations.filter(reservation => reservation.status === filter);
  }, [filter, reservations]);

  const stats = useMemo(() => ({
    all: reservations.length,
    active: reservations.filter(reservation => reservation.status === 'aktywna').length,
    finished: reservations.filter(reservation => reservation.status === 'zakonczona').length,
    cancelled: reservations.filter(reservation => reservation.status === 'anulowana').length,
  }), [reservations]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rezerwacje</h1>
          <p className="mt-0.5 text-sm text-gray-500">Podgląd wszystkich rezerwacji złożonych przez klientów.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadReservations}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Odśwież listę
          </button>
          <Link href="/admin/reservations/create" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Dodaj rezerwację
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Wszystkie</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.all}</p>
        </div>
        <div className="rounded-xl bg-green-50 p-5 shadow-sm ring-1 ring-green-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Aktywne</p>
          <p className="mt-2 text-3xl font-bold text-green-800">{stats.active}</p>
        </div>
        <div className="rounded-xl bg-blue-50 p-5 shadow-sm ring-1 ring-blue-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Zakończone</p>
          <p className="mt-2 text-3xl font-bold text-blue-800">{stats.finished}</p>
        </div>
        <div className="rounded-xl bg-red-50 p-5 shadow-sm ring-1 ring-red-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Anulowane</p>
          <p className="mt-2 text-3xl font-bold text-red-800">{stats.cancelled}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['wszystkie', 'aktywna', 'zakonczona', 'anulowana'] as const).map(status => {
          const isActive = filter === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
              }`}
            >
              {status === 'wszystkie' ? 'Wszystkie' : STATUS_LABEL[status]}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-500">
            Brak rezerwacji dla wybranego filtra.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Klient</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Auto</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Termin</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Odbiór</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Miejsca</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Koszt</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReservations.map(reservation => (
                  <tr key={reservation.id} className="hover:bg-gray-50/70">
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-lg bg-gray-100 p-2 text-gray-600">
                          <UserRound className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {reservation.profile?.first_name} {reservation.profile?.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{reservation.profile?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-lg bg-blue-50 p-2 text-blue-600">
                          <CarFront className="h-4 w-4" />
                        </div>
                        <div>
                          {reservation.car ? (
                            <>
                              <p className="font-semibold text-gray-900">{reservation.car.brand} {reservation.car.model}</p>
                              <p className="text-xs text-gray-500">{reservation.car.year}</p>
                              <Link href={`/admin/cars/${reservation.car.id}`} className="text-xs font-medium text-blue-600 hover:text-blue-800">
                                Zobacz auto →
                              </Link>
                            </>
                          ) : (
                            <p className="text-sm text-gray-500">Brak danych auta</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-lg bg-amber-50 p-2 text-amber-600">
                          <CalendarDays className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{formatDate(reservation.start_date)} - {formatDate(reservation.end_date)}</p>
                          <p className="text-xs text-gray-500">Utworzono: {formatDate(reservation.created_at)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <p className="font-semibold text-gray-900">{reservation.pickup_time || 'Brak danych'}</p>
                      <p className="text-xs text-gray-500">Zwrot do 19:00</p>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-lg bg-green-50 p-2 text-green-600">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-800"><span className="font-medium">Odbiór:</span> {reservation.pickup_location || '—'}</p>
                          <p className="text-sm text-gray-800"><span className="font-medium">Zwrot:</span> {reservation.return_location || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[reservation.status]}`}>
                        {STATUS_LABEL[reservation.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right align-top font-semibold text-gray-900">
                      {formatCurrency(reservation.total_price)}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/reservations/${reservation.id}/edit`} className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-amber-50 hover:text-amber-600" title="Edytuj">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        {confirmId === reservation.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(reservation.id)} className="rounded-lg bg-red-600 px-2 py-1 text-xs text-white transition-colors hover:bg-red-700">
                              Tak
                            </button>
                            <button onClick={() => setConfirmId(null)} className="rounded-lg bg-gray-200 px-2 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-300">
                              Nie
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmId(reservation.id)} disabled={deletingId === reservation.id} className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40" title="Usuń">
                            {deletingId === reservation.id ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" /> : <Trash2 className="h-4 w-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
