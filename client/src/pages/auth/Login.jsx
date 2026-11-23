// Login for customers and staff (FR-ACC-03). After login each role lands on its own area.
import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { roleHome, useAuth } from '../../lib/auth.jsx';
import { Alert, Button, Input } from '../../components/ui';
import AuthShell, { firstErrors, safeNext } from './AuthShell.jsx';
import ResendConfirmation from './ResendConfirmation.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));

  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null); // { message, code, fields }

  if (user) return <Navigate to={next ?? roleHome[user.role] ?? '/'} replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const u = await login(form.email, form.password);
      navigate(next ?? roleHome[u.role] ?? '/', { replace: true });
    } catch (err) {
      setError({ message: err.message, code: err.details?.code, fields: firstErrors(err.status === 400 ? err.details : null) });
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to see your bookings and travelers."
      footer={
        <>
          New to Beyond Borders?{' '}
          <Link to="/register" className="font-semibold text-primary-700 hover:text-primary-900">Create an account</Link>
        </>
      }
    >
      {error?.code === 'UNCONFIRMED' ? (
        <div className="space-y-4">
          <Alert tone="warning" title="Confirm your email first">
            We sent you a confirmation link when you registered. Didn&apos;t get it? Send a new one.
          </Alert>
          <ResendConfirmation defaultEmail={form.email} />
          <Button variant="ghost" className="w-full" onClick={() => setError(null)}>Back to login</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          {error && !Object.keys(error.fields).length && (
            <Alert tone="danger" title={error.message} />
          )}
          <Input label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={error?.fields?.email} required />
          <Input label="Password" type="password" autoComplete="current-password" value={form.password} onChange={set('password')} error={error?.fields?.password} required />
          <Button type="submit" className="w-full" loading={busy}>Log in</Button>
        </form>
      )}
    </AuthShell>
  );
}
