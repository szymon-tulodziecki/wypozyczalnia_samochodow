'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { reservationsAPI, authAPI } from '@/lib/api';
import { ReservationForm } from '../../ReservationForm';
import type { Reservation, User } from '@/types';

export default function EditReservationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    authAPI.getProfile()
      .then(user => {
        if (user.role !== 'root' && user.role !== 'agent') {
          router.replace('/admin');
          return;
        }
        setCurrentUser(user);
      })
      .catch(() => {
        router.replace('/admin/login');
      });
  }, [router]);

  useEffect(() => {
    reservationsAPI.getByIdAdmin(id)
      .then(res => {
        // Agents can only edit reservations for their assigned cars
        if (currentUser && currentUser.role === 'agent' && res.car?.agent_id !== currentUser.id) {
          setError('Brak uprawnień do edycji tej rezerwacji.');
          setReservation(null);
        } else {
          setReservation(res);
        }
      })
      .catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Nie udało się załadować rezerwacji.'))
      .finally(() => setLoading(false));
  }, [id, currentUser]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div>;
  }

  if (!reservation) {
    return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error || 'Nie znaleziono rezerwacji.'}</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edytuj rezerwację</h1>
          <p className="text-sm text-gray-500">Zmień dane terminu, odbioru i statusu rezerwacji.</p>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <ReservationForm
        currentUser={currentUser}
        initialValues={{
          userId: reservation.user_id,
          carId: reservation.car_id,
          startDate: reservation.start_date,
          endDate: reservation.end_date,
          pickupTime: reservation.pickup_time || '10:00',
          pickupLocation: reservation.pickup_location || '',
          returnLocation: reservation.return_location || '',
          notes: reservation.notes || '',
          status: reservation.status as Reservation['status'],
        }}
        loading={saving}
        submitLabel={saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
        onSubmit={async values => {
          setSaving(true);
          setError('');
          try {
            await reservationsAPI.updateAdmin(id, values);
            router.push('/admin/reservations');
          } catch (submissionError) {
            setError(submissionError instanceof Error ? submissionError.message : 'Nie udało się zapisać zmian.');
          } finally {
            setSaving(false);
          }
        }}
      />
    </div>
  );
}
