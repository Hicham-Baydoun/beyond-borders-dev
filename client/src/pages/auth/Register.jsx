// Customer registration (FR-ACC-01). Public registration creates customer accounts only.
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { roleHome, useAuth } from '../../lib/auth.jsx';
import { Alert, Button, Input } from '../../components/ui';
import AuthShell, { firstErrors } from './AuthShell.jsx';
import ResendConfirmation from './ResendConfirmation.jsx';

// Same rule as the server (FR-ACC-01): at least 8 characters, a letter and a digit.
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const PASSWORD_HINT = 'At least 8 characters, with at least one letter and one digit.';

export default function Register() {
  const { user } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [fields, setFields] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null); // registered email

  if (user) return <Navigate to={roleHome[user.role] ?? '/'} replace />;

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setFields((f) => ({ ...f, [k]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!PASSWORD_RULE.test(form.password)) {
      setFields({ password: `Use a stronger password. ${PASSWORD_HINT}` });
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api('/auth/register', { method: 'POST', body: form });
      setDone(form.email.trim().toLowerCase());
    } catch (err) {
      if (err.status === 400) setFields(firstErrors(err.details));
      else setError(err.message);
    } finally {
      setBusy(false);
    }
  };

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
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && (
          <Alert tone="danger" title={error} action={<Link to="/login" className="font-semibold underline">Go to login</Link>} />
        )}
        <Input label="Full name" autoComplete="name" value={form.fullName} onChange={set('fullName')} error={fields.fullName} required />
        <Input label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={fields.email} required />
        <Input label="Phone" type="tel" autoComplete="tel" placeholder="+961 70 123 456" value={form.phone} onChange={set('phone')} error={fields.phone} required />
        <Input label="Password" type="password" autoComplete="new-password" hint={PASSWORD_HINT} value={form.password} onChange={set('password')} error={fields.password} required />
        <Button type="submit" className="w-full" loading={busy}>Create account</Button>
      </form>
    </AuthShell>
  );
}
