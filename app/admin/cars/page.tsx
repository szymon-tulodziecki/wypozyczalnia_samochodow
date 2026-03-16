'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { carsAPI, authAPI } from '@/lib/api';
import type { Car, User } from '@/types';
import { Plus, Edit, Trash2, Eye, Search, Car as CarIcon, X } from 'lucide-react';

type Category = 'Wszystkie' | 'ekonomiczny' | 'komfort' | 'premium' | 'SUV' | 'van';
type FuelType = 'Wszystkie' | 'benzyna' | 'diesel' | 'elektryczny' | 'hybryda' | 'LPG';
type GearboxType = 'Wszystkie' | 'manualna' | 'automatyczna';
type SeatsOption = 'Wszystkie' | '2' | '4' | '5' | '7+';

const STATUS_CLS: Record<string, string> = {
  dostepny: 'bg-green-100 text-green-700',
  wynajety: 'bg-blue-100 text-blue-700',
  serwis:   'bg-amber-100 text-amber-700',
};
const STATUS_LABEL: Record<string, string> = { dostepny: 'Dostępny', wynajety: 'Wynajęty', serwis: 'Serwis' };

export default function CarsPage() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('Wszystkie');
  const [maxPrice, setMaxPrice] = useState(16000);
  const [fuelType, setFuelType] = useState<FuelType>('Wszystkie');
  const [gearbox, setGearbox] = useState<GearboxType>('Wszystkie');
  const [seats, setSeats] = useState<SeatsOption>('Wszystkie');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);
  const [, setUser] = useState<User | null>(null);

  useEffect(() => { authAPI.getProfile().then(setUser).catch(() => {}); }, []);

  useEffect(() => {
    carsAPI.getAll()
      .then(setCars)
      .catch(() => setError('Błąd ładowania samochodów'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (cars.length === 0) return;
    const dynamicMax = Math.max(...cars.map(c => c.price_per_day), 1000);
    setMaxPrice(Math.ceil(dynamicMax / 100) * 100);
  }, [cars]);

  useEffect(() => {
    if (!previewImage) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewImage(null);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [previewImage]);

  const handleDelete = async (id: string) => {
    setConfirmId(null);
    setDeletingId(id);
    try {
      await carsAPI.delete(id);
      setCars(prev => prev.filter(c => c.id !== id));
    } catch (e) { setError(e instanceof Error ? e.message : 'Błąd usuwania'); }
    finally { setDeletingId(null); }
  };

  const handleResetFilters = () => {
    setSearch('');
    setActiveCategory('Wszystkie');
    setFuelType('Wszystkie');
    setGearbox('Wszystkie');
    setSeats('Wszystkie');
    const dynamicMax = Math.max(...cars.map(c => c.price_per_day), 1000);
    setMaxPrice(Math.ceil(dynamicMax / 100) * 100);
  };

  const filtered = cars.filter(c => {
    const bySearch =
      `${c.brand} ${c.model}`.toLowerCase().includes(search.toLowerCase()) ||
      (c.license_plate ?? '').toLowerCase().includes(search.toLowerCase());
    if (!bySearch) return false;
    if (activeCategory !== 'Wszystkie' && c.category !== activeCategory) return false;
    if (c.price_per_day > maxPrice) return false;
    if (fuelType !== 'Wszystkie' && c.fuel_type !== fuelType) return false;
    if (gearbox !== 'Wszystkie' && c.gearbox !== gearbox) return false;
    if (seats !== 'Wszystkie') {
      const n = c.seats ?? 5;
      if (seats === '7+' && n < 7) return false;
      if (seats !== '7+' && n !== Number(seats)) return false;
    }
    return true;
  });

  const maxPriceLimit = Math.max(...cars.map(c => c.price_per_day), 1000);

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
          <h1 className="text-2xl font-bold text-gray-900">Zarządzanie samochodami</h1>
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

      {/* CRM Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {(['Wszystkie', 'ekonomiczny', 'komfort', 'premium', 'SUV', 'van'] as const).map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    active
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          <span className="text-xs tracking-wide uppercase text-gray-500">
            Wynik: <strong className="text-gray-700">{filtered.length}</strong> / {cars.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wide text-gray-500">Maks. cena / dobę</label>
              <span className="text-sm font-semibold text-gray-800">{maxPrice.toLocaleString('pl-PL')} zł</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxPriceLimit}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-gray-500">Paliwo</label>
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value as FuelType)}
              className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-blue-400"
            >
              <option value="Wszystkie">Wszystkie</option>
              <option value="benzyna">Benzyna</option>
              <option value="diesel">Diesel</option>
              <option value="elektryczny">Elektryczny</option>
              <option value="hybryda">Hybryda</option>
              <option value="LPG">LPG</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-gray-500">Skrzynia biegów</label>
            <select
              value={gearbox}
              onChange={(e) => setGearbox(e.target.value as GearboxType)}
              className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-blue-400"
            >
              <option value="Wszystkie">Wszystkie</option>
              <option value="manualna">Manualna</option>
              <option value="automatyczna">Automatyczna</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-gray-500">Liczba miejsc</label>
            <select
              value={seats}
              onChange={(e) => setSeats(e.target.value as SeatsOption)}
              className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-blue-400"
            >
              <option value="Wszystkie">Wszystkie</option>
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="7+">7+</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-1.5 text-xs rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Wyczyść filtry
          </button>
        </div>
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
                          <button
                            type="button"
                            onClick={() => setPreviewImage({ src: car.images[0], alt: `${car.brand} ${car.model}` })}
                            className="relative w-12 h-8 rounded-lg overflow-hidden shrink-0 border border-gray-100 hover:border-blue-300 transition-colors"
                            title="Powiększ zdjęcie"
                          >
                            <Image src={car.images[0]} alt="" fill unoptimized sizes="48px" className="object-cover" />
                          </button>
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

      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full aspect-16/10 rounded-xl overflow-hidden border border-white/20 bg-black">
              <Image
                src={previewImage.src}
                alt={previewImage.alt}
                fill
                unoptimized
                sizes="90vw"
                className="object-contain"
              />
            </div>
            <p className="text-center text-white/80 text-sm mt-3">{previewImage.alt}</p>
          </div>
        </div>
      )}
    </div>
  );
}
