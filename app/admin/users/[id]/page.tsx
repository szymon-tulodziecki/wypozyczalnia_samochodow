'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { usersAPI, authAPI } from '@/lib/api';
import type { User } from '@/types';
import { ArrowLeft, Pencil, Crown, UserIcon, Mail, Phone, Loader2 } from 'lucide-react';

const ROLE_CLS: Record<string, string> = {
  root:  'bg-amber-100 text-amber-700',
  user: 'bg-green-100 text-green-700',
};
const ROLE_LABEL: Record<string, string> = { root: 'Root', user: 'Użytkownik' };
const ROLE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = { root: Crown, user: UserIcon };

export default function ViewUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([authAPI.getProfile(), usersAPI.getById(id)])
      .then(([me, u]) => { setCurrentUser(me); setUser(u); })
      .catch(() => setError('Nie udało się załadować danych użytkownika.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-blue-600" /></div>;
  if (error || !user) return (
    <div className="text-center py-16">
      <p className="text-red-500 mb-4">{error || 'Użytkownik nie znaleziony.'}</p>
      <button onClick={() => router.back()} className="text-blue-600 hover:underline text-sm">← Wróć</button>
    </div>
  );

  const isAdmin = currentUser?.role === 'root';
  const canEdit = isAdmin && !(user.role === 'root' && user.id !== currentUser?.id);
  const RoleIcon = ROLE_ICONS[user.role] ?? UserIcon;
  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Profil użytkownika</h1>
        </div>
        {canEdit && (
          <Link href={`/admin/users/${id}/edit`}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium shadow-sm">
            <Pencil className="w-4 h-4" /> Edytuj
          </Link>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-blue-700 font-bold text-lg">{initials}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
            <span className={`inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_CLS[user.role]}`}>
              <RoleIcon className="w-3 h-3" />
              {ROLE_LABEL[user.role] ?? user.role}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Dane kontaktowe</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-gray-700 text-sm">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-gray-700 text-sm">{user.phone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Meta</h3>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">ID użytkownika</span>
          <span className="text-gray-700 font-mono text-xs">{user.id}</span>
        </div>
      </div>
    </div>
  );
}
