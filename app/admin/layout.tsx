'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { authAPI } from '@/lib/api';
import type { User } from '@/types';
import { Home, Car, Users, LogOut, Menu, X, Crown, CalendarDays, ExternalLink } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
        return;
      }

      authAPI.getProfile()
        .then(profile => {
          if (profile.role !== 'root') {
            router.replace('/konto');
            return;
          }
          setUser(profile);
        })
        .catch(() => router.replace('/login'))
        .finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const nav = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Rezerwacje', href: '/admin/reservations', icon: CalendarDays },
    { name: 'Samochody', href: '/admin/cars', icon: Car },
    { name: 'Uzytkownicy', href: '/admin/users', icon: Users },
  ];

  if (pathname === '/admin') return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) return null;

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full bg-gray-900 ${mobile ? 'w-64' : 'w-64'}`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
        <span className="text-white font-bold text-lg">AutoRent Admin</span>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                active ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4 mr-3 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-800 p-4">
        <Link
          href="/"
          className="flex items-center w-full px-3 py-2 mb-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
        >
          <ExternalLink className="w-4 h-4 mr-3" />
          Strona główna
        </Link>
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">
              {user.firstName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-3 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-sm font-medium text-white truncate">{user.firstName} {user.lastName}</p>
              <Crown className="w-3 h-3 text-yellow-400 shrink-0" />
            </div>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Wyloguj
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 h-full">
            <Sidebar mobile />
          </div>
        </div>
      )}

      <div className="hidden lg:flex lg:shrink-0">
        <div className="w-64">
          <div className="flex flex-col h-screen sticky top-0">
            <Sidebar />
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="lg:hidden flex items-center h-14 px-4 bg-gray-900 border-b border-gray-800">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white mr-3">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-white font-semibold">AutoRent Admin</span>
        </div>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
