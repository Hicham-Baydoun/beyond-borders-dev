// Frame for the agent and admin areas (KAN-82): a side menu built from config/menus.js,
// collapsing into a drawer under 1024 px. Public pages use Layout.jsx instead.
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { roleHome, roleLabel, staffMenus } from '../config/menus.js';
import { useAuth } from '../lib/auth.jsx';
import Logo from './Logo.jsx';
import MaintenanceBanner from './MaintenanceBanner.jsx';
import SettingsMenu from './SettingsMenu.jsx';
import { cx, useToast } from './ui';

const paths = {
  home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  people: 'M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6M22 19v-1a4 4 0 0 0-3-3.9M16 4.1a3 3 0 0 1 0 5.8',
  ticket: 'M3 8a2 2 0 0 0 0 4v0a2 2 0 0 0 0 4v2h18v-2a2 2 0 0 1 0-4 2 2 0 0 1 0-4V6H3zM14 6v12',
  plus: 'M12 5v14M5 12h14',
  card: 'M2 7h20v12H2zM2 11h20M6 15h4',
  star: 'M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18',
  tag: 'M20 12l-8 8-9-9V3h8zM7.5 7.5h.01',
  badge: 'M4 4h16v16H4zM9 10a3 3 0 1 0 6 0 3 3 0 0 0-6 0M7 18a5 5 0 0 1 10 0',
  scale: 'M12 3v18M5 7h14M5 7l-3 7h6zM19 7l-3 7h6z',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  cog: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.8-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.3V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.1a2 2 0 1 1 0 4z',
  out: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l-5-5 5-5M5 12h12',
  site: 'M14 3h7v7M10 14L21 3M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5',
};

export function StaffIcon({ name, className = 'h-[18px] w-[18px]' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

function SideLink({ to, label, icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cx(
          'group flex items-center gap-3 rounded-[2px] px-3 py-2.5 text-sm transition-colors',
          isActive ? 'bg-paper/10 text-paper' : 'text-primary-300 hover:bg-paper/5 hover:text-paper',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className={cx('h-4 w-0.5 rounded-full transition-colors', isActive ? 'bg-accent-300' : 'bg-transparent')} aria-hidden="true" />
          <StaffIcon name={icon} />
          {label}
        </>
      )}
    </NavLink>
  );
}

function Sidebar({ onSignOut }) {
  const { user } = useAuth();
  const groups = staffMenus[user.role] ?? [];
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-6 pt-6">
        <Logo light />
      </div>

      <div className="mx-5 border-y border-paper/10 py-4">
        <p className="font-display text-lg text-paper">{user.name}</p>
        <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.22em] text-accent-300">{roleLabel[user.role]}</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Staff">
        <SideLink to={roleHome[user.role]} label="Overview" icon="home" end />
        {groups.map((g) => (
          <div key={g.title} className="mt-6">
            <p className="px-3 pb-2 text-[0.6rem] uppercase tracking-[0.28em] text-primary-400">{g.title}</p>
            <div className="space-y-0.5">
              {g.items.map((item) => <SideLink key={item.to} {...item} end />)}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-paper/10 px-3 py-4">
        <Link to="/" className="flex items-center gap-3 px-3 py-2.5 text-sm text-primary-300 hover:text-paper">
          <span className="w-0.5" aria-hidden="true" />
          <StaffIcon name="site" /> Public site
        </Link>
        <button type="button" onClick={onSignOut} className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-primary-300 hover:text-paper">
          <span className="w-0.5" aria-hidden="true" />
          <StaffIcon name="out" /> Log out
        </button>
      </div>
    </div>
  );
}

export default function StaffLayout() {
  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);
  const drawerRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => setDrawer(false), [location.pathname]);

  // The drawer only exists below 1024 px: close it when the window grows, or the hidden drawer would keep the page inert.
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const onChange = (e) => e.matches && setDrawer(false);
    desktop.addEventListener('change', onChange);
    return () => desktop.removeEventListener('change', onChange);
  }, []);

  // Modal drawer: focus moves in, Tab stays inside, the page behind is inert, and focus returns on close.
  useEffect(() => {
    if (!drawer) return undefined;
    const panel = drawerRef.current;
    const focusable = () => [...panel.querySelectorAll('a[href], button:not([disabled])')];
    focusable()[0]?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') return setDrawer(false);
      if (e.key !== 'Tab') return undefined;
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
      return undefined;
    };
    document.addEventListener('keydown', onKey);
    const opener = openerRef.current;
    return () => {
      document.removeEventListener('keydown', onKey);
      opener?.focus();
    };
  }, [drawer]);

  const signOut = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (err) {
      toast.error('You are still logged in', `${err.message} Try logging out again.`);
    }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <a href="#staff-main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-2">
        Skip to content
      </a>

      {/* Desktop side menu */}
      <aside className="on-night sticky top-0 hidden h-screen bg-night lg:block">
        <Sidebar onSignOut={signOut} />
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div ref={drawerRef} className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Staff menu">
          <button type="button" tabIndex={-1} aria-label="Close menu" className="absolute inset-0 animate-fade-in bg-night/60" onClick={() => setDrawer(false)} />
          <aside className="on-night relative h-full w-72 max-w-[85%] animate-fade-in bg-night shadow-pop">
            <Sidebar onSignOut={signOut} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-col" inert={drawer ? '' : undefined}>
        <MaintenanceBanner />
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-primary-900/15 bg-paper/95 px-4 backdrop-blur sm:px-6 lg:px-10">
          <button
            ref={openerRef}
            type="button"
            className="-ml-2 flex h-11 w-11 items-center justify-center lg:hidden"
            aria-label="Open menu"
            aria-expanded={drawer}
            onClick={() => setDrawer(true)}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M3 8h18M3 16h18" />
            </svg>
          </button>
          <p className="eyebrow text-primary-500">Beyond Borders · Staff</p>
          <div className="ml-auto">
            <SettingsMenu />
          </div>
        </header>
        <main id="staff-main" className="flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
