'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usersAPI, authAPI } from '@/lib/api';
import type { User } from '@/types';
import { Plus, Search, Eye, Pencil, Trash2, Crown, UserIcon, Loader2 } from 'lucide-react';

const ROLE_CLS: Record<string, string> = {
  root:  'bg-amber-100 text-amber-700',
  agent: 'bg-blue-100 text-blue-700',
  klient: 'bg-green-100 text-green-700',
};
const ROLE_LABEL: Record<string, string> = { root: 'Root', agent: 'Agent', klient: 'Klient' };
const ROLE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = { root: Crown, agent: UserIcon, klient: UserIcon };

export default function UsersPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([authAPI.getProfile(), usersAPI.getAll()])
      .then(([me, all]) => { setCurrentUser(me); setUsers(all); })
      .catch(() => setError('Błąd ładowania użytkowników'))
      .finally(() => setLoading(false));
  }, []);

  const isAdmin = currentUser?.role === 'root';

  const canEdit = (target: User) => {
    return currentUser?.role === 'root' && !(target.role === 'root' && target.id !== currentUser.id);
  };

  const canDelete = (target: User) => {
    return currentUser?.role === 'root' && target.id !== currentUser.id && target.role !== 'root';
  };

  const handleDelete = async (id: string) => {
    setConfirmId(null);
    setDeletingId(id);
    try {
      await usersAPI.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (e) { setError(e instanceof Error ? e.message : 'Nie udało się usunąć użytkownika.'); }
    finally { setDeletingId(null); }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Użytkownicy</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} użytkowników</p>
        </div>
        {isAdmin && (
          <Link href="/admin/users/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Dodaj użytkownika
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm flex-1 min-w-52">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Szukaj użytkownika..."
            className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Wszystkie role</option>
          <option value="root">Root</option>
          <option value="agent">Agent</option>
          <option value="klient">Klient</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <UserIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Brak użytkowników</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Użytkownik</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Email</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rola</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Telefon</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(user => {
                  const RoleIcon = ROLE_ICONS[user.role] ?? UserIcon;
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <span className="text-blue-700 font-semibold text-xs">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900">{user.firstName} {user.lastName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 hidden md:table-cell">{user.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_CLS[user.role]}`}>
                          <RoleIcon className="w-3 h-3" />
                          {ROLE_LABEL[user.role] ?? user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">{user.phone ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/users/${user.id}`}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Podgląd">
                            <Eye className="w-4 h-4" />
                          </Link>
                          {canEdit(user) && (
                            <Link href={`/admin/users/${user.id}/edit`}
                              className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edytuj">
                              <Pencil className="w-4 h-4" />
                            </Link>
                          )}
                          {canDelete(user) && (
                            confirmId === user.id ? (
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleDelete(user.id)}
                                  className="px-2 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                  Tak
                                </button>
                                <button onClick={() => setConfirmId(null)}
                                  className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                                  Nie
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => setConfirmId(user.id)} disabled={deletingId === user.id}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40" title="Usuń">
                                {deletingId === user.id
                                  ? <Loader2 className="w-4 h-4 animate-spin" />
                                  : <Trash2 className="w-4 h-4" />}
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
