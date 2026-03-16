'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usersAPI, authAPI } from '@/lib/api';
import type { User } from '@/types';
import { ArrowLeft, Loader2 } from 'lucide-react';

const inp = "w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white";
const Card = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
    <div>
      <h2 className="font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '',
    role: 'agent' as 'agent' | 'root',
    password: '', confirmPassword: '',
  });

  useEffect(() => {
    Promise.all([authAPI.getProfile(), usersAPI.getById(id)])
      .then(([me, u]) => {
        setCurrentUser(me);
        setForm(f => ({ ...f, firstName: u.firstName ?? '', lastName: u.lastName ?? '', phone: u.phone ?? '', role: u.role as typeof f.role }));
      })
      .catch(() => setError('Nie udało się załadować danych użytkownika.'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName) { setError('Imię i nazwisko są wymagane.'); return; }
    if (form.password && form.password !== form.confirmPassword) { setError('Hasła nie są identyczne.'); return; }
    if (form.password && form.password.length < 6) { setError('Hasło musi mieć co najmniej 6 znaków.'); return; }
    setSaving(true); setError('');
    try {
      const updates: Record<string, unknown> = { firstName: form.firstName, lastName: form.lastName, phone: form.phone || undefined };
      if (currentUser?.role === 'root') updates.role = form.role;
      if (form.password) updates.password = form.password;
      await usersAPI.update(id, updates);
      router.push(`/admin/users/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Błąd podczas zapisywania.');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edytuj użytkownika</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className={inp} />
            </div>
            {currentUser?.role === 'root' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rola</label>
                <select value={form.role} onChange={e => set('role', e.target.value as typeof form.role)} className={inp}>
                  <option value="user">Użytkownik</option>
                  <option value="root">Root</option>
                </select>
              </div>
            )}
          </div>
        </Card>

        <Card title="Zmiana hasła" subtitle="Zostaw puste jeśli nie chcesz zmieniać hasła">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nowe hasło</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="min. 6 znaków" className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Powtórz hasło</label>
              <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} className={inp} />
            </div>
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
