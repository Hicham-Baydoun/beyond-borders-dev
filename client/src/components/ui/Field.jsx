// Form controls with a label, an optional hint and an inline error.
// Every input has a label, and errors are linked with aria-describedby (accessibility rule in KAN-81).
import { forwardRef, useId } from 'react';
import { cx } from './cx.js';

const control = (error) =>
  cx(
    'block w-full rounded-[2px] border bg-surface/70 px-3.5 py-2.5 text-sm text-primary-900 transition',
    'placeholder:text-primary-300 focus:outline-none focus:ring-2 disabled:bg-paper-dark disabled:text-primary-400',
    error
      ? 'border-danger-600 focus:border-danger-600 focus:ring-danger-600/20'
      : 'border-primary-900/25 focus:border-primary-900 focus:ring-primary-900/10',
  );

export function Field({ label, hint, error, required, id, className, children }) {
  const autoId = useId();
  const fieldId = id || autoId;
  const describedBy =
    [hint && !error && `${fieldId}-hint`, error && `${fieldId}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cx('space-y-1.5', className)}>
      {label && (
        <label htmlFor={fieldId} className="block text-[0.65rem] font-medium uppercase tracking-[0.22em] text-primary-600">
          {label}
          {required && (
            <span className="text-danger-600" aria-hidden="true">
              {' '}*
            </span>
          )}
        </label>
      )}
      {children({ id: fieldId, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined, required })}
      {hint && !error && (
        <p id={`${fieldId}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fieldId}-error`} className="flex items-start gap-1 text-xs font-medium text-danger-700">
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef(function Input({ label, hint, error, required, id, className, ...props }, ref) {
  return (
    <Field label={label} hint={hint} error={error} required={required} id={id} className={className}>
      {(a11y) => <input ref={ref} className={control(error)} {...a11y} {...props} />}
    </Field>
  );
});

// Native date input: works with the keyboard and on phones without an extra library.
export const DatePicker = forwardRef(function DatePicker(props, ref) {
  return <Input ref={ref} type="date" {...props} />;
});

export const Textarea = forwardRef(function Textarea(
  { label, hint, error, required, id, className, rows = 4, ...props },
  ref,
) {
  return (
    <Field label={label} hint={hint} error={error} required={required} id={id} className={className}>
      {(a11y) => <textarea ref={ref} rows={rows} className={control(error)} {...a11y} {...props} />}
    </Field>
  );
});

// options: [{ value, label }]; or pass <option> children.
export const Select = forwardRef(function Select(
  { label, hint, error, required, id, className, options = [], placeholder, children, ...props },
  ref,
) {
  return (
    <Field label={label} hint={hint} error={error} required={required} id={id} className={className}>
      {(a11y) => (
        <select ref={ref} className={cx(control(error), 'pr-9')} {...a11y} {...props}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
          {children}
        </select>
      )}
    </Field>
  );
});
