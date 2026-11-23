// Login for customers and staff (FR-ACC-03). After login each role lands on its own area.
// Built with the shared form pattern (KAN-83): same schema as the server, errors under the right field.
import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { loginSchema } from '@bb/shared';
import { roleHome, useAuth } from '../../lib/auth.jsx';
import { useApiForm } from '../../lib/useApiForm.js';
import { Alert, Button } from '../../components/ui';
import { FormError, FormInput } from '../../components/ui/FormField.jsx';
import AuthShell, { safeNext } from './AuthShell.jsx';
import ResendConfirmation from './ResendConfirmation.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const expired = params.get('expired') === '1';
  const [unconfirmedEmail, setUnconfirmedEmail] = useState(null);

  const form = useApiForm(loginSchema, { email: '', password: '' });

  if (user) return <Navigate to={next ?? roleHome[user.role] ?? '/'} replace />;

  const onSubmit = form.submit(async ({ email, password }) => {
    try {
      const u = await login(email, password);
      navigate(next ?? roleHome[u.role] ?? '/', { replace: true });
    } catch (err) {
      if (err.details?.code === 'UNCONFIRMED') {
        setUnconfirmedEmail(email);
        return;
      }
      throw err;
    }
  });

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
      {unconfirmedEmail ? (
        <div className="space-y-4">
          <Alert tone="warning" title="Confirm your email first">
            We sent you a confirmation link when you registered. Didn&apos;t get it? Send a new one.
          </Alert>
          <ResendConfirmation defaultEmail={unconfirmedEmail} />
          <Button variant="ghost" className="w-full" onClick={() => setUnconfirmedEmail(null)}>Back to login</Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {expired && !form.serverError && (
            <Alert tone="info" title="Your session ended">
              For your security you were logged out after 30 minutes without activity. Log in again to continue.
            </Alert>
          )}
          <FormError form={form} />
          <FormInput form={form} name="email" label="Email" type="email" autoComplete="email" required />
          <FormInput form={form} name="password" label="Password" type="password" autoComplete="current-password" required />
          <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>Log in</Button>
        </form>
      )}
    </AuthShell>
  );
}
