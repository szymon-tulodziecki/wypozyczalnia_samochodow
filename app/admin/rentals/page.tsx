'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { authAPI, carsAPI, reservationsAPI, usersAPI } from '@/lib/api';
import type { Car, Reservation, User } from '@/types';
import { CalendarDays, Search } from 'lucide-react';

type StatusFilter = 'wszystkie' | Reservation['status'];

const STATUS_LABEL: Record<Reservation['status'], string> = {
  aktywna: 'Aktywna',
  zakonczona: 'Zakonczona',
  anulowana: 'Anulowana',
};

const STATUS_CLS: Record<Reservation['status'], string> = {
  aktywna: 'bg-green-100 text-green-700',
  zakonczona: 'bg-slate-100 text-slate-700',
  anulowana: 'bg-red-100 text-red-700',
};

const STATUS_OPTIONS: Array<{ value: Reservation['status']; label: string }> = [
  { value: 'aktywna', label: 'Aktywna' },
  { value: 'zakonczona', label: 'Zakonczona' },
  { value: 'anulowana', label: 'Anulowana' },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pl-PL');
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(value);
}

export default function RentalsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [carsById, setCarsById] = useState<Record<string, Car>>({});
  const [usersById, setUsersById] = useState<Record<string, User>>({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('wszystkie');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    authAPI.getProfile().then(setUser).catch(() => setError('Brak dostepu do profilu'));
  }, []);

  useEffect(() => {
    if (!user) return;

    Promise.all([reservationsAPI.getAllAdmin(), carsAPI.getAll(), usersAPI.getAll()])
      .then(([reservationsData, carsData, usersData]) => {
        const carsMap = Object.fromEntries(carsData.map((car) => [car.id, car]));
        const usersMap = Object.fromEntries(usersData.map((u) => [u.id, u]));

        const scopedReservations =
          user.role === 'root'
            ? reservationsData
            : reservationsData.filter((reservation) => carsMap[reservation.car_id]?.agent_id === user.id);

        setCarsById(carsMap);
        setUsersById(usersMap);
        setReservations(scopedReservations);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Nie udalo sie pobrac wypozyczen');
      })
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return reservations.filter((reservation) => {
      if (statusFilter !== 'wszystkie' && reservation.status !== statusFilter) return false;

      const car = carsById[reservation.car_id];
      const customer = usersById[reservation.user_id];

      if (!needle) return true;

      const haystack = [
        car ? `${car.brand} ${car.model}` : '',
        car?.license_plate ?? '',
        customer ? `${customer.firstName} ${customer.lastName}` : '',
        customer?.email ?? '',
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [reservations, carsById, usersById, search, statusFilter]);

  const handleStatusChange = async (reservationId: string, status: Reservation['status']) => {
    const previous = reservations;
    setSavingId(reservationId);
    setReservations((prev) => prev.map((r) => (r.id === reservationId ? { ...r, status } : r)));

    try {
      await reservationsAPI.updateStatus(reservationId, status);
    } catch (err: unknown) {
      setReservations(previous);
      setError(err instanceof Error ? err.message : 'Nie udalo sie zapisac statusu');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 font-bold ml-4">x</button>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wypozyczenia</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} rezerwacji</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-2.5">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj po kliencie, aucie, rejestracji..."
            className="w-full outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="h-11 rounded-xl border border-gray-200 px-3 text-sm text-gray-700 bg-white outline-none focus:border-blue-400"
        >
          <option value="wszystkie">Wszystkie statusy</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Brak wypozyczen</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Klient</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Auto</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Termin</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kwota</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((reservation) => {
                  const car = carsById[reservation.car_id];
                  const customer = usersById[reservation.user_id];

                  return (
                    <tr key={reservation.id} className="hover:bg-gray-50/70 transition-colors align-top">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-900">
                          {customer ? `${customer.firstName} ${customer.lastName}` : 'Nieznany klient'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{customer?.email ?? '-'}</p>
                      </td>

                      <td className="px-5 py-3.5">
                        {car ? (
                          <>
                            <p className="font-semibold text-gray-900">{car.brand} {car.model}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {car.license_plate ?? '-'}
                              {' · '}
                              <Link href={`/admin/cars/${car.id}`} className="text-blue-600 hover:underline">podglad</Link>
                            </p>
                          </>
                        ) : (
                          <span className="text-gray-500">Auto usuniete</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <p className="text-gray-900">{formatDate(reservation.start_date)} - {formatDate(reservation.end_date)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">ID: {reservation.id.slice(0, 8)}</p>
                      </td>

                      <td className="px-5 py-3.5 font-semibold text-gray-900">
                        {formatMoney(reservation.total_price)}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-2">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${STATUS_CLS[reservation.status]}`}>
                            {STATUS_LABEL[reservation.status]}
                          </span>
                          <select
                            value={reservation.status}
                            disabled={savingId === reservation.id}
                            onChange={(e) => handleStatusChange(reservation.id, e.target.value as Reservation['status'])}
                            className="h-8 rounded-lg border border-gray-200 px-2 text-xs text-gray-700 bg-white outline-none focus:border-blue-400 disabled:opacity-60"
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
