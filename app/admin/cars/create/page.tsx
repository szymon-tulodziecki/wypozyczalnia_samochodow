'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { carsAPI, usersAPI, authAPI } from '@/lib/api';
import type { User } from '@/types';
import Image from 'next/image';
import { ArrowLeft, Upload, X } from 'lucide-react';

const FUEL_TYPES = ['benzyna', 'diesel', 'elektryczny', 'hybryda', 'LPG'] as const;
const GEARBOXES  = ['manualna', 'automatyczna'] as const;
const CATEGORIES = ['ekonomiczny', 'komfort', 'premium', 'SUV', 'van'] as const;
const STATUSES   = ['dostepny', 'wynajety', 'serwis'] as const;

const inp = "w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
    <h2 className="font-semibold text-gray-900">{title}</h2>
    {children}
  </div>
);

export default function CreateCarPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [assignableUsers, setAssignableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [mainImageIdx, setMainImageIdx] = useState(0);

  const [form, setForm] = useState({
    brand: '', model: '', year: new Date().getFullYear(), mileage: '',
    fuel_type: 'benzyna' as (typeof FUEL_TYPES)[number],
    gearbox: 'manualna' as (typeof GEARBOXES)[number],
    color: '', seats: '', category: 'ekonomiczny' as (typeof CATEGORIES)[number],
    price_per_day: '', status: 'dostepny' as (typeof STATUSES)[number],
    license_plate: '', description: '', features: '', agent_id: '',
  });

  useEffect(() => {
    authAPI.getProfile().then(setCurrentUser);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    usersAPI.getRegularUsers().then(users => setAssignableUsers(users.filter(u => u.role === 'agent'))).catch(() => {});
  }, [currentUser]);

  const set = (k: keyof typeof form, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (i: number) => {
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
    if (mainImageIdx >= i && mainImageIdx > 0) setMainImageIdx(mainImageIdx - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const tempId = `temp-${Date.now()}-${i}`;
        const url = await carsAPI.uploadImage(tempId, imageFiles[i]);
        uploadedUrls.push(url);
      }
      // Put main image first
      const sortedImages = uploadedUrls.length > 0
        ? [uploadedUrls[mainImageIdx], ...uploadedUrls.filter((_, i) => i !== mainImageIdx)]
        : [];
      const car = await carsAPI.create({
        brand: form.brand.trim(),
        model: form.model.trim(),
        year: Number(form.year),
        mileage: form.mileage ? Number(form.mileage) : undefined,
        fuel_type: form.fuel_type,
        gearbox: form.gearbox,
        color: form.color.trim() || undefined,
        seats: form.seats ? Number(form.seats) : undefined,
        category: form.category,
        price_per_day: Number(form.price_per_day),
        status: form.status,
        license_plate: form.license_plate.trim() || undefined,
        description: form.description.trim() || undefined,
        features: form.features ? form.features.split(',').map(f => f.trim()).filter(Boolean) : [],
        agent_id: form.agent_id || undefined,
      });
      // update images with real car id
      if (sortedImages.length > 0) {
        await carsAPI.update(car.id, { images: sortedImages } as never);
      }
      setSuccess(true);
      setTimeout(() => router.push('/admin/cars'), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Blad tworzenia samochodu');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/admin/cars')} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Dodaj samochód</h1>
      </div>

      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">Samochód dodany! Przekierowywanie...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card title="Dane podstawowe">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marka *</label>
              <input required value={form.brand} onChange={e => set('brand', e.target.value)} className={inp} placeholder="Toyota" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
              <input required value={form.model} onChange={e => set('model', e.target.value)} className={inp} placeholder="Corolla" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rok produkcji</label>
              <input type="number" value={form.year} onChange={e => set('year', Number(e.target.value))} min={1990} max={2030} className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Przebieg (km)</label>
              <input type="number" value={form.mileage} onChange={e => set('mileage', e.target.value)} className={inp} placeholder="50000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kolor</label>
              <input value={form.color} onChange={e => set('color', e.target.value)} className={inp} placeholder="Czarny" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Liczba miejsc</label>
              <input type="number" value={form.seats} onChange={e => set('seats', e.target.value)} className={inp} min={1} max={9} placeholder="5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nr rejestracyjny</label>
              <input value={form.license_plate} onChange={e => set('license_plate', e.target.value)} className={inp} placeholder="WA 12345" />
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
              <input required type="number" value={form.price_per_day} onChange={e => set('price_per_day', e.target.value)} min={0} step={0.01} className={inp} placeholder="150.00" />
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
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} className={`${inp} resize-none`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wyposażenie (oddzielone przecinkami)</label>
            <input value={form.features} onChange={e => set('features', e.target.value)} className={inp} placeholder="klimatyzacja, GPS, bluetooth" />
          </div>
        </Card>

        <Card title="Zdjęcia">
          <label className="inline-flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl transition-colors text-sm">
            <Upload className="w-4 h-4" /> Dodaj zdjęcia
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
          </label>
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {imagePreviews.map((url, i) => (
                <div key={i} onClick={() => setMainImageIdx(i)}
                  className={`relative h-24 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${mainImageIdx === i ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Image src={url} alt="" fill unoptimized sizes="25vw" className="object-cover" />
                  {mainImageIdx === i && <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">Główne</span>}
                  <button type="button" onClick={e => { e.stopPropagation(); removeImage(i); }}
                    className="absolute top-1 right-1 bg-white/90 hover:bg-red-50 text-red-500 rounded-full p-0.5 shadow-sm">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.push('/admin/cars')}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
            Anuluj
          </button>
          <button type="submit" disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-sm disabled:opacity-50">
            {loading ? 'Zapisywanie...' : 'Dodaj samochód'}
          </button>
        </div>
      </form>
    </div>
  );
}
