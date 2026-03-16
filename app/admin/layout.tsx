'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Car, CalendarDays, ExternalLink, Home, LogOut, Menu, Users, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { authAPI } from '@/lib/api';
import type { User } from '@/types';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Rezerwacje', href: '/admin/reservations', icon: CalendarDays },
    { name: 'Samochody', href: '/admin/cars', icon: Car },
    { name: 'Użytkownicy', href: '/admin/users', icon: Users },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
        return;
      }

      authAPI
        .getProfile()
        .then((profile) => {
          if (profile.role !== 'root') {
            router.replace('/account');
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

  const isActive = (href: string) => pathname.startsWith(href);

  const Sidebar = ({ mobile }: { mobile?: boolean }) => (
    <aside className={`${mobile ? 'w-72' : 'w-72'} bg-gray-900 text-white flex flex-col h-full border-gray-800 ${mobile ? '' : 'border-r'}`}>
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
        <div>
          <p className="text-sm font-semibold">AutoRent CRM</p>
          <p className="text-xs text-gray-400">Panel administratora</p>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="text-gray-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={mobile ? () => setSidebarOpen(false) : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive(item.href)
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {user && (
        <div className="border-t border-gray-800 px-4 py-3 space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
            onClick={mobile ? () => setSidebarOpen(false) : undefined}
          >
            <ExternalLink className="w-4 h-4" />
            Strona główna
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
              {user.firstName?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-red-100 bg-red-900/50 hover:bg-red-800/70 border border-red-800 rounded-lg px-3 py-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Wyloguj
          </button>
        </div>
      )}
    </aside>
  );

  if (pathname === '/admin') return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) return null;

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
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="lg:hidden flex items-center h-14 px-4 bg-gray-900 border-b border-gray-800">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-300 hover:text-white mr-3">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-white font-semibold">AutoRent Admin</span>
        </div>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
