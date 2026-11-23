// Opens the email confirmation link (FR-ACC-02): /confirm?token=...
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { Alert, Button, Spinner } from '../../components/ui';
import AuthShell from './AuthShell.jsx';
import ResendConfirmation from './ResendConfirmation.jsx';

export default function Confirm() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [state, setState] = useState(token ? { status: 'loading' } : { status: 'error', code: 400, message: 'This confirmation link is incomplete. Open the link from your email again, or request a new one.' });
  const sent = useRef(false); // a link works once, so never send it twice (React strict mode runs effects twice)

  useEffect(() => {
    if (!token || sent.current) return;
    sent.current = true;
    api('/auth/confirm', { method: 'POST', body: { token } })
      .then((r) => setState({ status: 'ok', message: r.message }))
      .catch((err) => setState({ status: 'error', code: err.status, message: err.message }));
  }, [token]);

  if (state.status === 'loading') {
    return (
      <AuthShell title="Confirming your email">
        <div className="flex justify-center py-6"><Spinner label="Confirming your email" /></div>
      </AuthShell>
    );
  }

  if (state.status === 'ok' || state.code === 409) {
    return (
      <AuthShell title={state.status === 'ok' ? 'Email confirmed' : 'Already confirmed'}>
        <div className="space-y-4">
          <Alert tone="success">{state.message}</Alert>
          <Button to="/login" className="w-full">Log in</Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="We couldn't confirm your email">
      <div className="space-y-4">
        <Alert tone="danger">{state.message}</Alert>
        <p className="text-sm text-slate-600">Enter your email and we&apos;ll send you a new link.</p>
        <ResendConfirmation />
      </div>
    </AuthShell>
  );
}
