// Public site frame: header with a mobile menu, page content and footer.
// UI-02 (KAN-82) adds the staff side menu and role-based menus on top of this.
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { roleHome, useAuth } from '../lib/auth.jsx';
import { api } from '../lib/api.js';
import Logo from './Logo.jsx';
import { Button, cx } from './ui';

// The menu shows only the signed-in role's functions (FR-ACC-04, TC-ACC-04-01). The server still checks every request.
const menus = {
  VISITOR: [{ to: '/search', label: 'Explore trips' }],
  CUSTOMER: [
    { to: '/search', label: 'Explore trips' },
    { to: '/my-bookings', label: 'My bookings' },
  ],
  AGENT: [
    { to: '/agent/customers', label: 'Customers' },
    { to: '/agent/bookings', label: 'Bookings' },
    { to: '/agent/payments', label: 'Payments' },
    { to: '/agent/documents', label: 'Documents' },
  ],
  ADMINISTRATOR: [
    { to: '/admin/catalog', label: 'Catalog' },
    { to: '/admin/staff', label: 'Staff' },
    { to: '/admin/reports', label: 'Reports' },
    { to: '/admin/audit', label: 'Audit log' },
    { to: '/admin/cancellation-policy', label: 'Cancellation policy' },
  ],
};

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cx(
          'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive ? 'bg-primary-50 text-primary-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
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
        setState(
          h.database === 'up'
            ? { tone: 'up', text: 'All systems operational' }
            : { tone: 'down', text: 'Database unavailable' },
        ),
      )
      .catch(() => setState({ tone: 'down', text: 'API not reachable' }));
  }, []);
  const dot = { checking: 'bg-slate-400', up: 'bg-success-600', down: 'bg-danger-600' }[state.tone];
  return (
    <span className="inline-flex items-center gap-2 text-xs text-primary-100/80">
      <span className={cx('h-2 w-2 rounded-full', dot)} aria-hidden="true" />
      {state.text}
    </span>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const links = menus[user?.role] ?? menus.VISITOR;

  const signOut = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
        <nav className="container-page flex h-16 items-center gap-4" aria-label="Main">
          <Logo />
          <div className="ml-6 hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <NavItem key={l.to} {...l} />
            ))}
          </div>
          <span className="flex-1" />
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <Button to={roleHome[user.role] ?? '/'} variant="secondary" size="sm">
                  {user.name}
                </Button>
                <Button variant="ghost" size="sm" onClick={signOut}>Log out</Button>
              </>
            ) : (
              <>
                <Button to="/login" variant="ghost" size="sm">Log in</Button>
                <Button to="/register" size="sm">Create account</Button>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            className="-mr-2 w-11 px-0 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </Button>
        </nav>
        {menuOpen && (
          <div id="mobile-menu" className="animate-fade-in border-t border-slate-200 bg-white md:hidden">
            <div className="container-page flex flex-col gap-1 py-3">
              {links.map((l) => (
                <NavItem key={l.to} {...l} />
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                {user ? (
                  <>
                    <Button to={roleHome[user.role] ?? '/'} variant="secondary">{user.name}</Button>
                    <Button variant="ghost" onClick={signOut}>Log out</Button>
                  </>
                ) : (
                  <>
                    <Button to="/login" variant="secondary">Log in</Button>
                    <Button to="/register">Create account</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main id="main" className={cx('flex-1', !isHome && 'container-page py-8 sm:py-10')}>
        <Outlet />
      </main>

      <footer className="bg-primary-950 text-primary-100">
        <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 lg:col-span-2">
            <Logo light />
            <p className="max-w-sm text-sm text-primary-100/70">
              Where dreams travel further. Hand-picked packages, real people behind every booking.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Travel</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/search" className="hover:text-white">Explore trips</Link></li>
              <li><Link to="/my-bookings" className="hover:text-white">My bookings</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Account</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white">Log in</Link></li>
              <li><Link to="/register" className="hover:text-white">Create account</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="container-page flex flex-col gap-2 py-5 text-xs text-primary-100/60 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Beyond Borders Travel. CSC 490 project.</span>
            <ApiStatus />
          </div>
        </div>
      </footer>
    </div>
  );
}
