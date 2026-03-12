'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { carsAPI, authAPI } from '@/lib/api';
import type { Car, User } from '@/types';
import { Plus, Edit, Trash2, Eye, Search, Car as CarIcon } from 'lucide-react';

const STATUS_CLS: Record<string, string> = {
  dostepny: 'bg-green-100 text-green-700',
  wynajety: 'bg-blue-100 text-blue-700',
  serwis:   'bg-amber-100 text-amber-700',
};
const STATUS_LABEL: Record<string, string> = { dostepny: 'Dostępny', wynajety: 'Wynajęty', serwis: 'Serwis' };

export default function CarsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const isAdmin = user?.role === 'root';

  useEffect(() => { authAPI.getProfile().then(setUser).catch(() => {}); }, []);

  useEffect(() => {
    if (!user) return;
    carsAPI.getAll()
      .then(data => setCars(isAdmin ? data : data.filter(c => c.agent_id === user.id)))
      .catch(() => setError('Błąd ładowania samochodów'))
      .finally(() => setLoading(false));
  }, [user, isAdmin]);

  const handleDelete = async (id: string) => {
    setConfirmId(null);
    setDeletingId(id);
    try {
      await carsAPI.delete(id);
      setCars(prev => prev.filter(c => c.id !== id));
    } catch (e) { setError(e instanceof Error ? e.message : 'Błąd usuwania'); }
    finally { setDeletingId(null); }
  };

  const filtered = cars.filter(c =>
    `${c.brand} ${c.model}`.toLowerCase().includes(search.toLowerCase()) ||
    (c.license_plate ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Zarządzanie samochodami' : 'Moje samochody'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} samochodów</p>
        </div>
        <Link href="/admin/cars/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Dodaj samochód
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Szukaj po marce, modelu, rejestracji..."
          className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CarIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Brak samochodów</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Samochód</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Kategoria</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Paliwo</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cena/dobę</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Rejestracja</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(car => (
                  <tr key={car.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {car.images?.[0] ? (
                          <div className="relative w-12 h-8 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                            <Image src={car.images[0]} alt="" fill unoptimized sizes="48px" className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                            <CarIcon className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{car.brand} {car.model}</p>
                          <p className="text-xs text-gray-400">{car.year} · {car.gearbox}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 capitalize hidden md:table-cell">{car.category}</td>
                    <td className="px-5 py-3.5 text-gray-600 hidden md:table-cell">{car.fuel_type}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900">
                      {new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(car.price_per_day)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CLS[car.status]}`}>
                        {STATUS_LABEL[car.status] ?? car.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">{car.license_plate || '–'}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => router.push(`/admin/cars/${car.id}`)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Podgląd">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => router.push(`/admin/cars/${car.id}/edit`)}
                          className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edytuj">
                          <Edit className="w-4 h-4" />
                        </button>
                        {confirmId === car.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(car.id)}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                              Tak
                            </button>
                            <button onClick={() => setConfirmId(null)}
                              className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                              Nie
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmId(car.id)} disabled={deletingId === car.id}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40" title="Usuń">
                            {deletingId === car.id
                              ? <div className="w-4 h-4 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
                              : <Trash2 className="w-4 h-4" />}
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
