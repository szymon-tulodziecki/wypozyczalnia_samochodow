'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { carsAPI, usersAPI, authAPI } from '@/lib/api';
import { Car, TrendingUp, CheckCircle, UserCog, UserPlus, Eye, Wrench, CalendarDays, ExternalLink } from 'lucide-react';
import type { Car as CarType, User } from '@/types';

const STATUS_CLS: Record<string, string> = {
  dostepny: 'bg-green-100 text-green-700',
  wynajety: 'bg-blue-100 text-blue-700',
  serwis:   'bg-amber-100 text-amber-700',
};
const STATUS_LABEL: Record<string, string> = {
  dostepny: 'Dostępny', wynajety: 'Wynajęty', serwis: 'Serwis',
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({ total: 0, available: 0, rented: 0, service: 0, users: 0 });
  const [recent, setRecent] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { authAPI.getProfile().then(setUser).catch(() => {}); }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const cars = await carsAPI.getAll();
        const users = (await usersAPI.getRegularUsers()).length;
        setStats({
          total: cars.length,
          available: cars.filter(c => c.status === 'dostepny').length,
          rented:    cars.filter(c => c.status === 'wynajety').length,
          service:   cars.filter(c => c.status === 'serwis').length,
          users,
        });
        setRecent(cars.slice(0, 6));
      } finally { setLoading(false); }
    })();
  }, [user]);

  const pln = (n: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(n);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
    </div>
  );

  const statCards = [
    { label: 'Wszystkie auta',                         value: stats.total,     icon: Car,      bg: 'bg-blue-50',   icon_cls: 'text-blue-600'  },
    { label: 'Dostępne',                               value: stats.available,  icon: TrendingUp,bg: 'bg-green-50',  icon_cls: 'text-green-600' },
    { label: 'Wynajęte',                               value: stats.rented,     icon: CheckCircle,bg:'bg-indigo-50', icon_cls: 'text-indigo-600'},
    { label: 'Serwis',                                 value: stats.service,    icon: Wrench,   bg: 'bg-amber-50',  icon_cls: 'text-amber-600' },
    { label: 'Użytkownicy',                            value: stats.users,      icon: UserCog,  bg: 'bg-purple-50', icon_cls: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Witaj z powrotem, <span className="font-medium text-gray-700">{user?.firstName}</span>!</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {statCards.map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-5 flex items-center gap-4`}>
            <div className="shrink-0">
              <s.icon className={`w-7 h-7 ${s.icon_cls}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Szybkie akcje</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <Link href="/admin/cars/create"
            className="bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-xl p-4 flex items-center gap-3 transition-colors group">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Szybka akcja</p>
              <p className="font-semibold text-gray-800 text-sm">Dodaj samochód</p>
            </div>
          </Link>
          <Link href="/admin/users/create"
            className="bg-white border border-gray-200 hover:border-green-400 hover:bg-green-50/50 rounded-xl p-4 flex items-center gap-3 transition-colors group">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <UserPlus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Szybka akcja</p>
              <p className="font-semibold text-gray-800 text-sm">Dodaj użytkownika</p>
            </div>
          </Link>
          <Link href="/admin/cars"
            className="bg-white border border-gray-200 hover:border-purple-400 hover:bg-purple-50/50 rounded-xl p-4 flex items-center gap-3 transition-colors group">
            <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Szybka akcja</p>
              <p className="font-semibold text-gray-800 text-sm">Lista samochodów</p>
            </div>
          </Link>
          <Link href="/admin/reservations"
            className="bg-white border border-gray-200 hover:border-amber-400 hover:bg-amber-50/50 rounded-xl p-4 flex items-center gap-3 transition-colors group">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
              <CalendarDays className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Szybka akcja</p>
              <p className="font-semibold text-gray-800 text-sm">Przegląd rezerwacji</p>
            </div>
          </Link>
          <Link href="/"
            className="bg-white border border-gray-200 hover:border-gray-400 hover:bg-gray-50 rounded-xl p-4 flex items-center gap-3 transition-colors group">
            <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <ExternalLink className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Nawigacja</p>
              <p className="font-semibold text-gray-800 text-sm">Przejdź do strony głównej</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent cars table */}
      {recent.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Ostatnio dodane</h2>
            <Link href="/admin/cars" className="text-xs text-blue-600 hover:underline">Zobacz wszystkie →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Samochód</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Kategoria</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cena/dobę</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map(car => (
                  <tr key={car.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{car.brand} {car.model}</p>
                      <p className="text-xs text-gray-400">{car.year}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600 capitalize hidden md:table-cell">{car.category}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900">{pln(car.price_per_day)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CLS[car.status]}`}>
                        {STATUS_LABEL[car.status] ?? car.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/admin/cars/${car.id}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                        Szczegóły →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}