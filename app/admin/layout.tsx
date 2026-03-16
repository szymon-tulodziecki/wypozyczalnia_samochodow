'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { authAPI } from '@/lib/api';
import type { User } from '@/types';
import { Home, Car, Users, LogOut, Menu, X, Crown, CalendarDays, PanelLeftClose, PanelLeftOpen, type LucideIcon, ExternalLink } from 'lucide-react';

const IDLE_TIMEOUT_MS = 20 * 60 * 1000;
const WARNING_BEFORE_MS = 2 * 60 * 1000;
const TITLE_UPDATE_INTERVAL_MS = 15 * 1000;

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

function AdminSidebar({
  mobile = false,
  collapsed = false,
  nav,
  pathname,
  user,
  onClose,
  onToggleCollapse,
  onLogout,
}: {
  mobile?: boolean;
  collapsed?: boolean;
  nav: NavItem[];
  pathname: string;
  user: User;
  onClose: () => void;
  onToggleCollapse: () => void;
  onLogout: () => void;
}) {
  return (
    <div className={`flex flex-col h-full bg-gray-900 ${mobile ? 'w-64' : collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
        <span className="text-white font-bold text-lg">{mobile || !collapsed ? 'AutoRent Admin' : 'AR'}</span>
        {!mobile && (
          <button onClick={onToggleCollapse} className="text-gray-400 hover:text-white" title={collapsed ? 'Rozwiń pasek' : 'Zwiń pasek'}>
            {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        )}
        {mobile && (
          <button onClick={onClose} className="text-gray-400 hover:text-white">
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
              onClick={onClose}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${collapsed && !mobile ? 'justify-center' : ''} ${
                active ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              title={item.name}
            >
              <item.icon className={`w-4 h-4 shrink-0 ${collapsed && !mobile ? '' : 'mr-3'}`} />
              {(mobile || !collapsed) && item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-800 p-4">
        <div className={`flex items-center mb-3 ${collapsed && !mobile ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">
              {user.firstName?.charAt(0).toUpperCase()}
            </span>
          </div>
          {(mobile || !collapsed) && (
            <div className="ml-3 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium text-white truncate">{user.firstName} {user.lastName}</p>
                {user.role === 'root' && <Crown className="w-3 h-3 text-yellow-400 shrink-0" />}
              </div>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={onLogout}
          className={`flex items-center w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors ${collapsed && !mobile ? 'justify-center' : ''}`}
          title="Wyloguj"
        >
          <LogOut className={`w-4 h-4 ${collapsed && !mobile ? '' : 'mr-3'}`} />
          {(mobile || !collapsed) && 'Wyloguj'}
        </button>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    __adminLogoutTimer?: number;
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const [idleSecondsLeft, setIdleSecondsLeft] = useState(0);

  const defaultTitleRef = useRef('');
  const warningTimerRef = useRef<number | null>(null);
  const logoutTimerRef = useRef<number | null>(null);
  const countdownTickRef = useRef<number | null>(null);
  const titleTickCounterRef = useRef(0);
  const showIdleWarningRef = useRef(false);
  const idleSecondsRef = useRef(0);

  const isLoginPage = pathname === '/admin';

  const clearPublicSession = () => {
    localStorage.removeItem('motion_drive_session');
  };

  const clearIdleTimers = () => {
    if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) window.clearTimeout(logoutTimerRef.current);
    if (countdownTickRef.current) window.clearInterval(countdownTickRef.current);
    warningTimerRef.current = null;
    logoutTimerRef.current = null;
    countdownTickRef.current = null;
  };

  const formatIdleCountdown = (totalSeconds: number) => {
    const safeSeconds = Math.max(0, totalSeconds);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const restoreTitle = () => {
    if (defaultTitleRef.current) document.title = defaultTitleRef.current;
  };

  const updateHiddenTabTitle = useCallback((secondsLeft: number, force = false) => {
    if (!document.hidden || !showIdleWarningRef.current) return;
    if (!force) {
      titleTickCounterRef.current += 1;
      const everyNTicks = Math.max(1, Math.round(TITLE_UPDATE_INTERVAL_MS / 1000));
      if (titleTickCounterRef.current % everyNTicks !== 0) return;
    }
    document.title = `CRM: wylogowanie za ${formatIdleCountdown(secondsLeft)}`;
  }, []);

  function cancelScheduledLogout() {
    if (window.__adminLogoutTimer) {
      window.clearTimeout(window.__adminLogoutTimer);
      window.__adminLogoutTimer = undefined;
    }
  }

  const runForcedLogout = useCallback(async () => {
    clearIdleTimers();
    cancelScheduledLogout();
    setShowIdleWarning(false);
    clearPublicSession();
    await supabase.auth.signOut();
    restoreTitle();
    router.replace('/admin');
  }, [router]);

  const resetInactivity = useCallback(() => {
    if (isLoginPage || !user) return;

    clearIdleTimers();

    titleTickCounterRef.current = 0;
    setShowIdleWarning(false);
    setIdleSecondsLeft(Math.ceil(IDLE_TIMEOUT_MS / 1000));

    warningTimerRef.current = window.setTimeout(() => {
      setShowIdleWarning(true);
      showIdleWarningRef.current = true;
      titleTickCounterRef.current = 0;
    }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);

    logoutTimerRef.current = window.setTimeout(() => {
      void runForcedLogout();
    }, IDLE_TIMEOUT_MS);
  }, [isLoginPage, runForcedLogout, user]);

  useEffect(() => {
    if (isLoginPage) {
      return;
    }
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
    clearIdleTimers();
    cancelScheduledLogout();
    await supabase.auth.signOut();
    clearPublicSession();
    restoreTitle();
    router.replace('/admin');
  };

  const handleStayLoggedIn = () => {
    resetInactivity();
    restoreTitle();
  };

  useEffect(() => {
    showIdleWarningRef.current = showIdleWarning;
  }, [showIdleWarning]);

  useEffect(() => {
    idleSecondsRef.current = idleSecondsLeft;
  }, [idleSecondsLeft]);

  useEffect(() => {
    cancelScheduledLogout();

    return () => {
      window.__adminLogoutTimer = window.setTimeout(() => {
        clearPublicSession();
        void supabase.auth.signOut();
        window.__adminLogoutTimer = undefined;
      }, 300);
    };
  }, []);

  useEffect(() => {
    if (isLoginPage || !user) return;

    defaultTitleRef.current = document.title;
    const initialResetTimer = window.setTimeout(() => {
      resetInactivity();
    }, 0);

    const onActivity = () => {
      resetInactivity();
      if (!document.hidden) restoreTitle();
    };

    const onVisibilityChange = () => {
      if (!document.hidden) {
        restoreTitle();
        return;
      }
      updateHiddenTabTitle(idleSecondsRef.current, true);
    };

    window.addEventListener('mousemove', onActivity);
    window.addEventListener('mousedown', onActivity);
    window.addEventListener('keydown', onActivity);
    window.addEventListener('scroll', onActivity, { passive: true });
    window.addEventListener('touchstart', onActivity, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    countdownTickRef.current = window.setInterval(() => {
      setIdleSecondsLeft((previous) => {
        const secondsLeft = Math.max(0, previous - 1);
        if (secondsLeft <= Math.ceil(WARNING_BEFORE_MS / 1000)) {
          setShowIdleWarning(true);
        }
        updateHiddenTabTitle(secondsLeft);
        return secondsLeft;
      });
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('mousedown', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('scroll', onActivity);
      window.removeEventListener('touchstart', onActivity);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.clearTimeout(initialResetTimer);
      clearIdleTimers();
      restoreTitle();
    };
  }, [isLoginPage, user, resetInactivity, updateHiddenTabTitle]);

  const isAdmin = user?.role === 'root';

  const nav = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Rezerwacje', href: '/admin/reservations', icon: CalendarDays },
    { name: 'Samochody', href: '/admin/cars', icon: Car },
    ...(isAdmin ? [{ name: 'Użytkownicy', href: '/admin/users', icon: Users }] : []),
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {showIdleWarning && (
        <div className="fixed top-4 right-4 z-50 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl shadow-lg px-4 py-3 w-[min(420px,calc(100vw-2rem))]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Wykryto bezczynność w CRM</p>
              <p className="text-sm mt-1">
                Wylogowanie za <strong>{formatIdleCountdown(idleSecondsLeft)}</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowIdleWarning(false)}
              className="text-amber-700 hover:text-amber-900"
              aria-label="Zamknij komunikat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleStayLoggedIn}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors"
            >
              Pozostań zalogowany
            </button>
            <button
              type="button"
              onClick={() => void runForcedLogout()}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-amber-300 hover:bg-amber-100 text-amber-900 transition-colors"
            >
              Wyloguj teraz
            </button>
          </div>
        </div>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 h-full">
            <AdminSidebar
              mobile
              nav={nav}
              pathname={pathname}
              user={user}
              onClose={() => setSidebarOpen(false)}
              onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      <div className="hidden lg:flex lg:shrink-0">
        <div className={sidebarCollapsed ? 'w-20' : 'w-64'}>
          <div className="flex flex-col h-screen sticky top-0">
            <AdminSidebar
              collapsed={sidebarCollapsed}
              nav={nav}
              pathname={pathname}
              user={user}
              onClose={() => setSidebarOpen(false)}
              onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
              onLogout={handleLogout}
            />
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
