'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { carsAPI, usersAPI, authAPI } from '@/lib/api';
import type { User } from '@/types';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';

const FUEL_TYPES = ['benzyna', 'diesel', 'elektryczny', 'hybryda', 'LPG'] as const;
const GEARBOXES  = ['manualna', 'automatyczna'] as const;
const CATEGORIES = ['ekonomiczny', 'komfort', 'premium', 'SUV', 'van'] as const;
const STATUSES   = ['dostepny', 'wynajety', 'serwis'] as const;

const inp = "w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white";
const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
    <h2 className="font-semibold text-gray-900">{title}</h2>
    {children}
  </div>
);

export default function EditCarPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [assignableUsers, setAssignableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [mainImageUrl, setMainImageUrl] = useState('');

  const [form, setForm] = useState({
    brand: '', model: '', year: new Date().getFullYear(), mileage: '',
    fuel_type: 'benzyna' as (typeof FUEL_TYPES)[number],
    gearbox: 'manualna' as (typeof GEARBOXES)[number],
    color: '', seats: '', category: 'ekonomiczny' as (typeof CATEGORIES)[number],
    price_per_day: '', status: 'dostepny' as (typeof STATUSES)[number],
    license_plate: '', description: '', features: '', agent_id: '',
  });

  useEffect(() => {
    Promise.all([authAPI.getProfile(), carsAPI.getById(id)])
      .then(([user, car]) => {
        setCurrentUser(user);
        setExistingImages(car.images ?? []);
        setMainImageUrl(car.images?.[0] ?? '');
        setForm({
          brand: car.brand ?? '', model: car.model ?? '',
          year: car.year ?? new Date().getFullYear(),
          mileage: car.mileage?.toString() ?? '',
          fuel_type: car.fuel_type as (typeof FUEL_TYPES)[number] ?? 'benzyna',
          gearbox: car.gearbox as (typeof GEARBOXES)[number] ?? 'manualna',
          color: car.color ?? '', seats: car.seats?.toString() ?? '',
          category: car.category as (typeof CATEGORIES)[number] ?? 'ekonomiczny',
          price_per_day: car.price_per_day?.toString() ?? '',
          status: car.status as (typeof STATUSES)[number] ?? 'dostepny',
          license_plate: car.license_plate ?? '', description: car.description ?? '',
          features: (car.features ?? []).join(', '), agent_id: car.agent_id ?? '',
        });
        usersAPI.getRegularUsers().then(setAssignableUsers).catch(() => {});
      })
      .catch(() => setError('Nie udało się załadować danych.'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (k: keyof typeof form, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setNewImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setNewImagePreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeExisting = (url: string) => {
    setExistingImages(prev => prev.filter(u => u !== url));
    if (mainImageUrl === url) setMainImageUrl(existingImages.find(u => u !== url) ?? '');
  };
  const removeNew = (idx: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== idx));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brand || !form.model || !form.price_per_day) { setError('Wypełnij wymagane pola.'); return; }
    setSaving(true); setError('');
    try {
      const allImages = [...existingImages];
      for (const file of newImageFiles) allImages.push(await carsAPI.uploadImage(id, file));
      const sorted = mainImageUrl ? [mainImageUrl, ...allImages.filter(u => u !== mainImageUrl)] : allImages;
      await carsAPI.update(id, {
        brand: form.brand, model: form.model, year: Number(form.year),
        mileage: form.mileage ? Number(form.mileage) : undefined,
        fuel_type: form.fuel_type, gearbox: form.gearbox,
        color: form.color || undefined, seats: form.seats ? Number(form.seats) : undefined,
        category: form.category, price_per_day: Number(form.price_per_day),
        status: form.status, license_plate: form.license_plate || undefined,
        description: form.description || undefined,
        features: form.features ? form.features.split(',').map(f => f.trim()).filter(Boolean) : [],
        agent_id: form.agent_id || undefined, images: sorted,
      });
      router.push(`/admin/cars/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Błąd podczas zapisywania.');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edytuj samochód</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card title="Zdjęcia">
          {[...existingImages, ...newImagePreviews].length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {existingImages.map(url => (
                <div key={url} onClick={() => setMainImageUrl(url)}
                  className={`relative h-24 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${mainImageUrl === url ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Image src={url} alt="" fill unoptimized sizes="25vw" className="object-cover" />
                  {mainImageUrl === url && <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">Główne</span>}
                  <button type="button" onClick={e => { e.stopPropagation(); removeExisting(url); }}
                    className="absolute top-1 right-1 bg-white/90 hover:bg-red-50 text-red-500 rounded-full p-0.5 shadow-sm">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {newImagePreviews.map((src, idx) => (
                <div key={idx} className="relative h-24 rounded-lg overflow-hidden border-2 border-dashed border-blue-200">
                  <Image src={src} alt="" fill unoptimized sizes="25vw" className="object-cover opacity-80" />
                  <span className="absolute top-1 left-1 bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded">Nowe</span>
                  <button type="button" onClick={() => removeNew(idx)}
                    className="absolute top-1 right-1 bg-white/90 hover:bg-red-50 text-red-500 rounded-full p-0.5 shadow-sm">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="inline-flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl transition-colors text-sm">
            <Upload className="w-4 h-4" /> Dodaj zdjęcia
            <input type="file" accept="image/*" multiple onChange={handleNewImages} className="hidden" />
          </label>
        </Card>

        <Card title="Dane podstawowe">
          <div className="grid grid-cols-2 gap-4">
            {(['brand', 'model'] as const).map(k => (
              <div key={k}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{k === 'brand' ? 'Marka *' : 'Model *'}</label>
                <input value={form[k]} onChange={e => set(k, e.target.value)} required className={inp} />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rok produkcji</label>
              <input type="number" min={1990} max={2030} value={form.year} onChange={e => set('year', Number(e.target.value))} className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Przebieg (km)</label>
              <input type="number" min={0} value={form.mileage} onChange={e => set('mileage', e.target.value)} className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kolor</label>
              <input value={form.color} onChange={e => set('color', e.target.value)} className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Liczba miejsc</label>
              <input type="number" min={1} max={20} value={form.seats} onChange={e => set('seats', e.target.value)} className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nr rejestracyjny</label>
              <input value={form.license_plate} onChange={e => set('license_plate', e.target.value)} className={inp} />
            </div>
          </div>
        </Card>

        <Card title="Specyfikacja">
          <div className="grid grid-cols-2 gap-4">
            {([
              ['fuel_type', 'Paliwo', FUEL_TYPES],
              ['gearbox', 'Skrzynia biegów', GEARBOXES],
              ['category', 'Kategoria', CATEGORIES],
              ['status', 'Status', STATUSES],
            ] as const).map(([k, label, opts]) => (
              <div key={k}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <select value={form[k]} onChange={e => set(k, e.target.value)} className={inp}>
                  {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cena za dobę (PLN) *</label>
              <input type="number" min={0} step="0.01" value={form.price_per_day} onChange={e => set('price_per_day', e.target.value)} required className={inp} />
            </div>
            {assignableUsers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opiekun oferty</label>
                <select value={form.agent_id} onChange={e => set('agent_id', e.target.value)} className={inp}>
                  <option value="">Brak przypisania</option>
                  {assignableUsers.map(a => <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>)}
                </select>
              </div>
            )}
          </div>
        </Card>

        <Card title="Opis i wyposażenie">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opis</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4}
              className={`${inp} resize-none`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wyposażenie (oddzielone przecinkami)</label>
            <input value={form.features} onChange={e => set('features', e.target.value)} placeholder="klimatyzacja, nawigacja, tempomat" className={inp} />
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
            Anuluj
          </button>
          <button type="submit" disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
        </div>
      </form>
    </div>
  );
}
