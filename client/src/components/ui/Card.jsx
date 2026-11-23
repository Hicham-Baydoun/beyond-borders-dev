import { cx } from './cx.js';

export default function Card({ as: Tag = 'div', className, padded = true, children, ...props }) {
  return (
    <Tag
      className={cx('rounded-[2px] border border-primary-900/10 bg-surface shadow-card', padded && 'p-5 sm:p-6', className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
