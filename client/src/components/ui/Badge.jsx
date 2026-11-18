// A badge always shows text and an icon next to its color, so color is never the only signal.
import { cx } from './cx.js';

const tones = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  primary: 'bg-primary-50 text-primary-800 ring-primary-200',
  success: 'bg-success-50 text-success-700 ring-success-600/20',
  warning: 'bg-warning-50 text-warning-700 ring-warning-600/20',
  danger: 'bg-danger-50 text-danger-700 ring-danger-600/20',
  accent: 'bg-accent-50 text-accent-700 ring-accent-200',
};

export default function Badge({ tone = 'neutral', icon, className, children }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}

// Statuses from the Prisma BookingStatus enum. PENDING is shown to people as "Held".
const bookingStatus = {
  PENDING: { label: 'Held', tone: 'warning', icon: '◷' },
  CONFIRMED: { label: 'Confirmed', tone: 'success', icon: '✓' },
  EXPIRED: { label: 'Expired', tone: 'neutral', icon: '–' },
  CANCELLED: { label: 'Cancelled', tone: 'danger', icon: '✕' },
  REFUNDED: { label: 'Refunded', tone: 'primary', icon: '↺' },
  COMPLETED: { label: 'Completed', tone: 'primary', icon: '★' },
};

export function BookingStatusBadge({ status }) {
  const s = bookingStatus[status] ?? { label: status, tone: 'neutral' };
  return (
    <Badge tone={s.tone} icon={s.icon}>
      {s.label}
    </Badge>
  );
}
