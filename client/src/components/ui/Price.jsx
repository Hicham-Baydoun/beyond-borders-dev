// Formats money the same way everywhere a total is shown. Accepts numbers or Prisma Decimal strings.
import { cx } from './cx.js';

export function formatPrice(amount, currency = 'USD') {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  if (value == null || Number.isNaN(value)) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function Price({ amount, currency = 'USD', suffix, className }) {
  return (
    <span className={cx('font-semibold tabular-nums', className)}>
      {formatPrice(amount, currency)}
      {suffix && <span className="ml-1 text-xs font-normal text-slate-500">{suffix}</span>}
    </span>
  );
}
