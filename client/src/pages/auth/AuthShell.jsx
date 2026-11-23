// Frame shared by the login, register and confirm pages.
import { LogoMark } from '../../components/Logo.jsx';
import { Card } from '../../components/ui';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto w-full max-w-md py-4 sm:py-8">
      <div className="mb-6 text-center">
        <LogoMark className="mx-auto h-12 w-12 text-primary-900" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
      </div>
      <Card>{children}</Card>
      {footer && <div className="mt-5 text-center text-sm text-slate-600">{footer}</div>}
    </div>
  );
}

// Server validation errors come as { field: [messages] }; forms show the first one per field.
export const firstErrors = (details) =>
  Object.fromEntries(Object.entries(details ?? {}).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));

// Only follow ?next= links inside this site.
export const safeNext = (next) => (next && next.startsWith('/') && !next.startsWith('//') ? next : null);
