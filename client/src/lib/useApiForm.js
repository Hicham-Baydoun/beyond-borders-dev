// The one way to build a form in this app (KAN-83):
//   - react-hook-form with the same Zod schema the server uses (from @bb/shared), so both agree;
//   - server field errors appear under their field, other errors in one message above the form;
//   - the submit button is disabled while sending, so a form is never sent twice.
//
// Usage:
//   const form = useApiForm(loginSchema, { email: '', password: '' });
//   <form onSubmit={form.submit((values) => api('/auth/login', { method: 'POST', body: values }))}>
//     <FormInput form={form} name="email" label="Email" />
//     <FormError form={form} />
//     <Button type="submit" loading={form.formState.isSubmitting}>Log in</Button>
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mapServerErrors } from './formErrors.js';

export function useApiForm(schema, defaultValues, options = {}) {
  const form = useForm({ resolver: zodResolver(schema), defaultValues, mode: 'onTouched', ...options });
  const [serverError, setServerError] = useState(null); // { message, retry }

  // Wraps a submit handler: validates, sends, and maps any API error onto the form.
  // Editing any field clears a stale server message (for example "Wrong email or password").
  useEffect(() => {
    const sub = form.watch(() => setServerError(null));
    return () => sub.unsubscribe();
  }, [form]);

  const submit = (onValid) => (event) => {
    setServerError(null); // before validation, so a failed client check never shows an old server error
    return form.handleSubmit(async (values) => {
      try {
        await onValid(values);
      } catch (err) {
        const mapped = mapServerErrors(err, Object.keys(defaultValues));
        for (const [name, message] of Object.entries(mapped.fields)) {
          form.setError(name, { type: 'server', message }, { shouldFocus: true });
        }
        if (mapped.form) setServerError({ message: mapped.form, retry: mapped.retry, status: err?.status, code: err?.details?.code });
      }
    })(event);
  };

  return { ...form, submit, serverError, clearServerError: () => setServerError(null) };
}
