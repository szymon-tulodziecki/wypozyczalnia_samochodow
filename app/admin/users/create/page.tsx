'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usersAPI, authAPI } from '@/lib/api';
import type { User } from '@/types';
import { ArrowLeft, Loader2 } from 'lucide-react';

const inp = 'w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white';

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
    <h2 className="text-base font-semibold text-gray-900">{title}</h2>
    {children}
  </div>
);

export default function CreateUserPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'user' as 'user' | 'root',
  });

  useEffect(() => {
    authAPI.getProfile().then(setCurrentUser).catch(() => {});
  }, []);

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.firstName || !form.lastName) {
      setError('Wypełnij wymagane pola: email, hasło, imię, nazwisko.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Hasła nie są identyczne.');
      return;
    }
    if (form.password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await usersAPI.create({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        role: form.role,
      });
      router.push('/admin/users');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Błąd podczas tworzenia użytkownika.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Dodaj użytkownika</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Dane osobowe">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imię *</label>
              <input value={form.firstName} onChange={e => set('firstName', e.target.value)} required className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nazwisko *</label>
              <input value={form.lastName} onChange={e => set('lastName', e.target.value)} required className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className={inp} />
            </div>
          </div>
          {currentUser?.role === 'root' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rola</label>
              <select value={form.role} onChange={e => set('role', e.target.value as 'user' | 'root')} className={inp}>
                <option value="user">Użytkownik</option>
                <option value="root">Root</option>
              </select>
            </div>
          )}
        </Card>

        <Card title="Hasło">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hasło * (min. 6 znaków)</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} required className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Powtórz hasło *</label>
              <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required className={inp} />
            </div>
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
            Anuluj
          </button>
          <button type="submit" disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Tworzenie…' : 'Utwórz użytkownika'}
          </button>
        </div>
      </form>
    </div>
  );
}
