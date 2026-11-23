// Hides pages from the wrong role. This is only UX: the server checks every request (FR-ACC-04).
// Not logged in: go to /login?next=... . Wrong role: the 403 page.
// `standalone` adds a minimal frame, for guards that sit outside Layout or StaffLayout.
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import Forbidden from '../pages/Forbidden.jsx';
import Logo from './Logo.jsx';
import { Spinner } from './ui';

export default function RequireRole({ roles, standalone = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  // Wait for /auth/me, otherwise a logged-in user is sent to /login on every page refresh.
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner label="Checking your account" />
      </div>
    );
  }
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} state={{ from: location }} replace />;
  }
  if (!roles.includes(user.role)) {
    if (!standalone) return <Forbidden />;
    return (
      <div className="min-h-screen">
        <div className="container-page flex h-[4.5rem] items-center border-b border-primary-900/15">
          <Logo />
        </div>
        <div className="container-page">
          <Forbidden />
        </div>
      </div>
    );
  }
  return <Outlet />;
}
