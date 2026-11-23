// Primary, accent, secondary, ghost and danger buttons.
// `loading` disables the button so a form cannot be sent twice. Pass `to` to render a router link.
import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import Spinner from './Spinner.jsx';
import { cx } from './cx.js';

const variants = {
  primary: 'bg-primary-900 text-paper hover:bg-primary-800 active:bg-primary-950',
  // accent-700 and darker keep white text above 4.5:1 contrast (WCAG AA).
  accent: 'bg-accent-700 text-white hover:bg-accent-800 active:bg-accent-900',
  secondary: 'bg-transparent text-primary-900 ring-1 ring-inset ring-primary-900/40 hover:bg-primary-900 hover:text-paper',
  ghost: 'text-primary-900 hover:bg-primary-900/5',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 shadow-sm',
};
const sizes = {
  sm: 'min-h-9 px-4 text-[0.7rem]',
  md: 'min-h-11 px-5 text-xs', // 44 px touch target (KAN-84)
  lg: 'min-h-12 px-7 text-[0.8rem]',
};

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, to, className, children, type = 'button', ...props },
  ref,
) {
  const classes = cx(
    'inline-flex items-center justify-center gap-2 rounded-[2px] font-medium uppercase tracking-[0.14em] transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant],
    sizes[size],
    className,
  );
  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner label="Please wait" />}
      {children}
    </button>
  );
});

export default Button;
