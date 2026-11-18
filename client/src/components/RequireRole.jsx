// Hides pages from the wrong role. This is only UX: the server checks every request (FR-ACC-04).
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { Button, EmptyState } from './ui';

export default function RequireRole({ roles }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} state={{ from: location }} replace />;
  }
  if (!roles.includes(user.role)) {
    return (
      <EmptyState icon="🔒" title="You do not have access to this page" action={<Button to="/">Back to home</Button>}>
        Your account cannot open this area. If you think this is a mistake, ask an administrator.
      </EmptyState>
    );
  }
  return <Outlet />;
}
