'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Car, Reservation, User } from '@/types';
import { carsAPI, usersAPI } from '@/lib/api';
import { Loader2 } from 'lucide-react';

type ReservationFormValues = {
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  pickupTime: string;
  pickupLocation: string;
  returnLocation: string;
  notes: string;
  status: Reservation['status'];
};

const inp = 'w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white';

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
    <h2 className="font-semibold text-gray-900">{title}</h2>
    {children}
  </div>
);

export function ReservationForm({
  initialValues,
  onSubmit,
  submitLabel,
  loading,
}: {
  initialValues: ReservationFormValues;
  onSubmit: (values: ReservationFormValues) => Promise<void>;
  submitLabel: string;
  loading: boolean;
}) {
  const [cars, setCars] = useState<Car[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<ReservationFormValues>(initialValues);
  const [error, setError] = useState('');
  const [bootLoading, setBootLoading] = useState(true);

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  useEffect(() => {
    Promise.all([carsAPI.getAll(), usersAPI.getAll()])
      .then(([carsData, usersData]) => {
        setCars(carsData);
        setUsers(usersData.filter(user => user.role === 'agent'));
      })
      .catch(() => setError('Nie udało się załadować listy aut lub użytkowników.'))
      .finally(() => setBootLoading(false));
  }, []);

  const selectedCar = useMemo(
    () => cars.find(car => car.id === form.carId) ?? null,
    [cars, form.carId],
  );

  const estimatedTotal = useMemo(() => {
    if (!selectedCar || !form.startDate || !form.endDate) return null;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    const days = diff > 0 ? diff : 1;
    return days * selectedCar.price_per_day;
  }, [form.endDate, form.startDate, selectedCar]);

  const setField = (field: keyof ReservationFormValues, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId || !form.carId || !form.startDate || !form.endDate || !form.pickupTime || !form.pickupLocation || !form.returnLocation) {
      setError('Wypełnij wszystkie wymagane pola.');
      return;
    }
    if (form.endDate < form.startDate) {
      setError('Data zwrotu nie może być wcześniejsza niż data odbioru.');
      return;
    }
    setError('');
    await onSubmit(form);
  };

  if (bootLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <Card title="Powiązania rezerwacji">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Klient *</label>
            <select value={form.userId} onChange={e => setField('userId', e.target.value)} className={inp} required>
              <option value="">Wybierz klienta</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.firstName} {user.lastName} • {user.email}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Auto *</label>
            <select value={form.carId} onChange={e => setField('carId', e.target.value)} className={inp} required>
              <option value="">Wybierz auto</option>
              {cars.map(car => (
                <option key={car.id} value={car.id}>{car.brand} {car.model} • {car.year}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card title="Termin i status">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Data odbioru *</label>
            <input type="date" value={form.startDate} onChange={e => setField('startDate', e.target.value)} className={inp} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Data zwrotu *</label>
            <input type="date" value={form.endDate} onChange={e => setField('endDate', e.target.value)} className={inp} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Godzina odbioru *</label>
            <input type="time" value={form.pickupTime} onChange={e => setField('pickupTime', e.target.value)} className={inp} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status *</label>
            <select value={form.status} onChange={e => setField('status', e.target.value)} className={inp} required>
              <option value="aktywna">Aktywna</option>
              <option value="zakonczona">Zakończona</option>
              <option value="anulowana">Anulowana</option>
            </select>
          </div>
        </div>
        <p className="text-sm text-gray-500">Godzina zwrotu jest ustawiana automatycznie na 19:00 ostatniego dnia.</p>
        {estimatedTotal !== null && (
          <p className="text-sm font-medium text-gray-800">Szacunkowy koszt: {new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(estimatedTotal)}</p>
        )}
      </Card>

      <Card title="Logistyka i uwagi">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Miejsce odbioru *</label>
            <input value={form.pickupLocation} onChange={e => setField('pickupLocation', e.target.value)} className={inp} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Miejsce zwrotu *</label>
            <input value={form.returnLocation} onChange={e => setField('returnLocation', e.target.value)} className={inp} required />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Uwagi</label>
            <textarea value={form.notes} onChange={e => setField('notes', e.target.value)} className={`${inp} min-h-28 resize-y`} />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => history.back()} className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
          Anuluj
        </button>
        <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
