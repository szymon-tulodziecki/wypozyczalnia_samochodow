'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { carsAPI, authAPI } from '@/lib/api';
import type { Car, User } from '@/types';
import { ArrowLeft, Pencil, Trash2, Loader2, Car as CarIcon, Fuel, Settings, Users, Tag, CheckCircle, Info, Calendar, Gauge } from 'lucide-react';

const STATUS_CLS: Record<string, string> = {
  dostepny: 'bg-green-100 text-green-700',
  wynajety: 'bg-blue-100 text-blue-700',
  serwis:   'bg-amber-100 text-amber-700',
};
const STATUS_LABEL: Record<string, string> = { dostepny: 'Dostępny', wynajety: 'Wynajęty', serwis: 'Serwis' };

export default function ViewCarPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([authAPI.getProfile(), carsAPI.getById(id)])
      .then(([user, c]) => { setCurrentUser(user); setCar(c); })
      .catch(() => setError('Nie udało się załadować danych samochodu.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm(`Usunąć samochód ${car?.brand} ${car?.model}? Tej operacji nie można cofnąć.`)) return;
    setDeleting(true);
    try {
      await carsAPI.delete(id);
      router.push('/admin/cars');
    } catch {
      alert('Nie udało się usunąć samochodu.');
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
    </div>
  );

  if (error || !car) return (
    <div className="text-center py-16">
      <p className="text-red-500 mb-4">{error || 'Samochód nie znaleziony.'}</p>
      <button onClick={() => router.back()} className="text-blue-600 hover:underline text-sm">← Wróć</button>
    </div>
  );

  const isAdmin = currentUser?.role === 'root';
  const images = car.images ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{car.brand} {car.model}</h1>
            <p className="text-gray-500 text-sm">{car.year} • {car.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CLS[car.status] ?? ''}`}>
            {STATUS_LABEL[car.status] ?? car.status}
          </span>
          <Link href={`/admin/cars/${id}/edit`}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium shadow-sm">
            <Pencil className="w-4 h-4" /> Edytuj
          </Link>
          {isAdmin && (
            <button onClick={handleDelete} disabled={deleting}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl transition-colors text-sm font-medium">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Usuń
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Galeria */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-gray-100 rounded-xl relative h-72 overflow-hidden border border-gray-200">
            {images.length > 0 ? (
              <Image src={images[activeImage]} alt={`${car.brand} ${car.model}`} fill unoptimized sizes="(max-width: 768px) 100vw, 60vw" className="object-cover" />
            ) : (
              <div className="w-full h-72 flex items-center justify-center text-gray-400">
                <CarIcon className="w-16 h-16" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImage(idx)}
                  className={`shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${activeImage === idx ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="relative w-16 h-12">
                    <Image src={img} alt="" fill unoptimized sizes="64px" className="object-cover" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Szczegóły */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {car.price_per_day?.toLocaleString('pl-PL')} zł
            </div>
            <p className="text-gray-500 text-sm">za dobę</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Dane</h3>
            <dl className="space-y-2 text-sm">
              {[
                [<Fuel className="w-4 h-4" key="f" />, 'Paliwo', car.fuel_type],
                [<Settings className="w-4 h-4" key="g" />, 'Skrzynia', car.gearbox],
                [<Users className="w-4 h-4" key="u" />, 'Miejsca', car.seats],
                [<Calendar className="w-4 h-4" key="y" />, 'Rok', car.year],
                [<Gauge className="w-4 h-4" key="m" />, 'Przebieg', car.mileage ? `${car.mileage.toLocaleString('pl-PL')} km` : '—'],
                [<Tag className="w-4 h-4" key="p" />, 'Rejestracja', car.license_plate ?? '—'],
                [<Info className="w-4 h-4" key="c" />, 'Kolor', car.color ?? '—'],
              ].map(([icon, label, val]) => (
                <div key={String(label)} className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-gray-500">{icon}{label}</dt>
                  <dd className="text-gray-900 font-medium">{val ?? '—'}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Opis */}
      {car.description && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Opis</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{car.description}</p>
        </div>
      )}

      {/* Wyposażenie */}
      {car.features && car.features.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Wyposażenie</h3>
          <div className="flex flex-wrap gap-2">
            {car.features.map(f => (
              <span key={f} className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full border border-gray-200">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                {f}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
