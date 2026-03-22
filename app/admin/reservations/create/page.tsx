'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { reservationsAPI, authAPI } from '@/lib/api';
import { ReservationForm } from '../ReservationForm';
import type { Reservation, User } from '@/types';

export default function CreateReservationPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dodaj rezerwację</h1>
          <p className="text-sm text-gray-500">Utwórz rezerwację ręcznie z poziomu panelu administratora.</p>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <ReservationForm
        currentUser={currentUser}
        initialValues={{
          userId: '',
          carId: '',
          startDate: '',
          endDate: '',
          pickupTime: '10:00',
          pickupLocation: 'Warszawa - Centrum',
          returnLocation: 'Warszawa - Centrum',
          notes: '',
          status: 'aktywna' satisfies Reservation['status'],
        }}
        loading={loading}
        submitLabel={loading ? 'Tworzenie...' : 'Utwórz rezerwację'}
        onSubmit={async values => {
          setLoading(true);
          setError('');
          try {
            await reservationsAPI.createAdmin(values);
            router.push('/admin/reservations');
          } catch (submissionError) {
            setError(submissionError instanceof Error ? submissionError.message : 'Nie udało się utworzyć rezerwacji.');
          } finally {
            setLoading(false);
          }
        }}
      />
    </div>
  );
}
