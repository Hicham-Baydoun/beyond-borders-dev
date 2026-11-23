// "Send me a new confirmation link" (FR-ACC-02). The server answers the same for every email.
import { useState } from 'react';
import { api } from '../../lib/api.js';
import { Alert, Button, Input } from '../../components/ui';

export default function ResendConfirmation({ defaultEmail = '' }) {
  const [email, setEmail] = useState(defaultEmail);
  const [state, setState] = useState({ busy: false, message: null, error: null });

  const submit = async (e) => {
    e.preventDefault();
    setState({ busy: true, message: null, error: null });
    try {
      const r = await api('/auth/confirm/resend', { method: 'POST', body: { email } });
      setState({ busy: false, message: r.message, error: null });
    } catch (err) {
      setState({ busy: false, message: null, error: err.details?.email?.[0] ?? err.message });
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={state.error} required />
      <Button type="submit" variant="secondary" className="w-full" loading={state.busy}>
        Send a new link
      </Button>
      {state.message && <Alert tone="success">{state.message}</Alert>}
    </form>
  );
}
