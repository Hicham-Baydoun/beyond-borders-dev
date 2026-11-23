// Inputs wired to a useApiForm() form (KAN-83). The error under each field comes from the shared schema
// in the browser, or from the server after submit; both appear in the same place.
import { Input } from './Field.jsx';
import Alert from './Alert.jsx';
import Button from './Button.jsx';

export function FormInput({ form, name, ...props }) {
  const error = form.formState.errors[name]?.message;
  return <Input {...form.register(name)} error={error} {...props} />;
}

// Form-level message (for example "Wrong email or password", or a 409 conflict with a retry action).
export function FormError({ form, onRetry, action }) {
  const e = form.serverError;
  if (!e) return null;
  return (
    <Alert
      tone="danger"
      title={e.message}
      action={action ?? (e.retry && onRetry ? <Button size="sm" variant="secondary" onClick={onRetry}>Try again</Button> : null)}
    />
  );
}
