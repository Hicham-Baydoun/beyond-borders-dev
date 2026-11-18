import { cx } from './cx.js';

export default function EmptyState({ icon = '🧭', title, children, action, className }) {
  return (
    <div
      className={cx(
        'flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center',
        className,
      )}
    >
      <span aria-hidden="true" className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-2xl">
        {icon}
      </span>
      <h2 className="text-base font-semibold">{title}</h2>
      {children && <div className="mt-1 max-w-md text-sm text-slate-600">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
