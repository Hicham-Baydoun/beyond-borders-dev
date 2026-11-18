// Errors say what went wrong (title) and what to do next (children or action), per SRS Section 6.6.
import { cx } from './cx.js';

const tones = {
  info: { box: 'border-primary-200 bg-primary-50 text-primary-900', icon: 'i' },
  success: { box: 'border-success-600/30 bg-success-50 text-success-700', icon: '✓' },
  warning: { box: 'border-warning-600/30 bg-warning-50 text-warning-700', icon: '!' },
  danger: { box: 'border-danger-600/30 bg-danger-50 text-danger-700', icon: '✕' },
};

export default function Alert({ tone = 'info', title, action, className, children }) {
  const t = tones[tone];
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cx('flex gap-3 rounded-xl border p-4 text-sm', t.box, className)}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-bold"
      >
        {t.icon}
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="opacity-90">{children}</div>}
        {action && <div className="pt-1">{action}</div>}
      </div>
    </div>
  );
}
