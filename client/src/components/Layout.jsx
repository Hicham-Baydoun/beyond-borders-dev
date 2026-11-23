// Site frame: location strip, header (logo and role menu on the left, account and settings on the right),
// page content and footer.
// UI-02 (KAN-82) adds the staff side menu on top of this.
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { publicMenus, roleHome } from '../config/menus.js';
import { useAuth } from '../lib/auth.jsx';
import { api } from '../lib/api.js';
import Logo, { LogoMark } from './Logo.jsx';
import SettingsMenu, { PinIcon } from './SettingsMenu.jsx';
import { useLocationPref } from '../lib/location.jsx';
import { Button, cx, useToast } from './ui';

// The public menu for visitors and customers comes from config/menus.js (FR-ACC-04, TC-ACC-04-01).
// Staff who visit the public site keep the visitor menu plus a link back to their dashboard (their name).

function NavItem({ to, label, onClick, large = false }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cx(
          'relative py-2 transition-colors',
          large ? 'font-display text-2xl' : 'text-[0.72rem] font-medium uppercase tracking-[0.2em]',
          isActive ? 'text-accent-700' : 'text-primary-900 hover:text-accent-700',
        )
      }
    >
      {label}
    </NavLink>
  );
}

function ApiStatus() {
  const [state, setState] = useState({ tone: 'checking', text: 'Checking system status' });
  useEffect(() => {
    api('/health')
      .then((h) =>
        setState(h.database === 'up' ? { tone: 'up', text: 'All systems operational' } : { tone: 'down', text: 'Database unavailable' }),
      )
      .catch(() => setState({ tone: 'down', text: 'API not reachable' }));
  }, []);
  const dot = { checking: 'bg-primary-400', up: 'bg-success-600', down: 'bg-danger-600' }[state.tone];
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cx('h-1.5 w-1.5 rounded-full', dot)} aria-hidden="true" />
      {state.text}
    </span>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { city } = useLocationPref();
  const toast = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const links = publicMenus[user?.role] ?? publicMenus.VISITOR;

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const signOut = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (err) {
      toast.error('You are still logged in', `${err.message} Try logging out again.`);
    }
  };

  const account = user ? (
    <>
      <Link to={roleHome[user.role] ?? '/'} className="text-[0.72rem] font-medium uppercase tracking-[0.2em] hover:text-accent-700">
        {user.name}
      </Link>
      <Button variant="secondary" size="sm" onClick={signOut}>Log out</Button>
    </>
  ) : (
    <>
      <Link to="/login" className="text-[0.72rem] font-medium uppercase tracking-[0.2em] hover:text-accent-700">Log in</Link>
      <Button to="/register" size="sm">Create account</Button>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-2">
        Skip to content
      </a>

      {/* Announcement strip: the visitor's location on the left */}
      <div className="on-night bg-night text-paper">
        <div className="container-page flex h-8 items-center justify-between gap-3 text-[0.65rem] uppercase tracking-[0.28em]">
          <span className="inline-flex items-center gap-1.5" title="Your location. Change it in Settings.">
            <PinIcon className="h-3.5 w-3.5 text-accent-300" />
            <span className="sr-only">Your location:</span>
            {city}
          </span>
          <span className="hidden text-accent-300 sm:inline">Season 2027 · Departures from Beirut</span>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-primary-900/15 bg-paper/95 backdrop-blur">
        <nav className="container-page flex h-[4.5rem] items-center gap-3 md:gap-10" aria-label="Main">
          <Logo />
          <div className="hidden items-center gap-7 md:flex">
            {links.map((l) => <NavItem key={l.to} {...l} />)}
          </div>
          <div className="ml-auto flex items-center gap-1 md:gap-5">
            <div className="hidden items-center gap-5 md:flex">{account}</div>
            <SettingsMenu />
            <button
              type="button"
              className="-mr-2 flex h-11 w-11 items-center justify-center md:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 8h18M3 16h18" />}
              </svg>
            </button>
          </div>
        </nav>
        {menuOpen && (
          <div id="mobile-menu" className="animate-fade-in border-t border-primary-900/15 bg-paper md:hidden">
            <div className="container-page flex flex-col py-4">
              {links.map((l) => <NavItem key={l.to} {...l} large />)}
              <div className="rule my-4" />
              <div className="flex items-center justify-between gap-4">{account}</div>
            </div>
          </div>
        )}
      </header>

      <main id="main" className={cx('flex-1', !isHome && 'container-page py-10 sm:py-14')}>
        <Outlet />
      </main>

      <footer className="on-night bg-night text-primary-100">
        <div className="container-page pt-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
            <div className="max-w-sm space-y-4">
              <p className="font-display text-2xl italic text-paper">“The world is a book, and those who do not travel read only one page.”</p>
              <p className="text-sm text-primary-300">Hand-picked packages from Beirut, with real people behind every booking.</p>
            </div>
            <div>
              <h2 className="eyebrow font-sans text-accent-300">Travel</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><Link to="/search" className="hover:text-paper">Explore trips</Link></li>
                <li><Link to="/my-bookings" className="hover:text-paper">My bookings</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="eyebrow font-sans text-accent-300">Account</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><Link to="/login" className="hover:text-paper">Log in</Link></li>
                <li><Link to="/register" className="hover:text-paper">Create account</Link></li>
              </ul>
            </div>
          </div>

          {/* Oversized wordmark */}
          <div className="mt-16 flex items-end gap-4 border-t border-white/10 pt-8 sm:gap-6">
            <LogoMark className="h-14 w-14 shrink-0 text-accent-300 sm:h-24 sm:w-24" />
            <p aria-hidden="true" className="font-display text-[13vw] uppercase leading-[0.8] tracking-tight text-paper lg:text-[9.5rem]">
              Beyond
              <br />
              Borders
            </p>
          </div>
          <p className="eyebrow mt-4 text-primary-300">Where dreams travel further</p>
        </div>
        <div className="mt-10 border-t border-white/10">
          <div className="container-page flex flex-col gap-2 py-5 text-[0.7rem] uppercase tracking-[0.2em] text-primary-400 sm:flex-row sm:items-center sm:justify-between">
            <span>
              © {new Date().getFullYear()} Beyond Borders Travel · CSC 490 ·{' '}
              <Link to="/credits" className="hover:text-paper">Photo credits</Link>
            </span>
            <ApiStatus />
          </div>
        </div>
      </footer>
    </div>
  );
}
