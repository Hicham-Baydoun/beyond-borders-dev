// Frame shared by the login, register and confirm pages.
import { LogoMark } from '../../components/Logo.jsx';
import { Card } from '../../components/ui';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto w-full max-w-md py-4 sm:py-8">
      <div className="mb-6 text-center">
        <LogoMark className="mx-auto h-12 w-12 text-primary-900" />
        <h1 className="mt-5 text-4xl sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 break-words text-sm text-primary-600">{subtitle}</p>}
      </div>
      <Card>{children}</Card>
      {footer && <div className="mt-6 text-center text-sm text-primary-600">{footer}</div>}
    </div>
  );
}

// Server validation errors come as { field: [messages] }; forms show the first one per field.
export const firstErrors = (details) =>
  Object.fromEntries(Object.entries(details ?? {}).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));

// Only follow ?next= links inside this site.
export const safeNext = (next) => (next && next.startsWith('/') && !next.startsWith('//') ? next : null);
