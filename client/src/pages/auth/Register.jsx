// Customer registration (FR-ACC-01). Public registration creates customer accounts only.
// Built with the shared form pattern (KAN-83): the password rule is the server's own schema from @bb/shared.
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { PASSWORD_HINT, registerSchema } from '@bb/shared';
import { api } from '../../lib/api.js';
import { roleHome, useAuth } from '../../lib/auth.jsx';
import { useApiForm } from '../../lib/useApiForm.js';
import { Alert, Button } from '../../components/ui';
import { FormError, FormInput } from '../../components/ui/FormField.jsx';
import AuthShell from './AuthShell.jsx';
import ResendConfirmation from './ResendConfirmation.jsx';

export default function Register() {
  const { user } = useAuth();
  const [done, setDone] = useState(null); // registered email
  const form = useApiForm(registerSchema, { fullName: '', email: '', phone: '', password: '' });

  if (user) return <Navigate to={roleHome[user.role] ?? '/'} replace />;

  const onSubmit = form.submit(async (values) => {
    await api('/auth/register', { method: 'POST', body: values });
    setDone(values.email);
  });

  if (done) {
    return (
      <AuthShell title="Check your email" subtitle={`We sent a confirmation link to ${done}.`}>
        <div className="space-y-4">
          <Alert tone="success" title="Your account is almost ready">
            Open the link in the email to activate your account. It is valid for 24 hours and works once.
          </Alert>
          <p className="text-sm text-slate-600">Didn&apos;t get the email? Check your spam folder, or send a new link.</p>
          <ResendConfirmation defaultEmail={done} />
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Save your travelers and follow your bookings in one place."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-700 hover:text-primary-900">Log in</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormError
          form={form}
          action={form.serverError?.status === 409 ? <Link to="/login" className="font-semibold underline">Go to login</Link> : undefined}
        />
        <FormInput form={form} name="fullName" label="Full name" autoComplete="name" required />
        <FormInput form={form} name="email" label="Email" type="email" autoComplete="email" required />
        <FormInput form={form} name="phone" label="Phone" type="tel" autoComplete="tel" placeholder="+961 70 123 456" required />
        <FormInput form={form} name="password" label="Password" type="password" autoComplete="new-password" hint={PASSWORD_HINT} required />
        <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>Create account</Button>
      </form>
    </AuthShell>
  );
}
