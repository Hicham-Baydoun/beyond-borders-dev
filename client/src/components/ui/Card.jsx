import { cx } from './cx.js';

export default function Card({ as: Tag = 'div', className, padded = true, children, ...props }) {
  return (
    <Tag
      className={cx('rounded-2xl border border-slate-200/80 bg-white shadow-card', padded && 'p-5 sm:p-6', className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
