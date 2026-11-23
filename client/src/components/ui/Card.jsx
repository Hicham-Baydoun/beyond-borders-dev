import { cx } from './cx.js';

export default function Card({ as: Tag = 'div', className, padded = true, children, ...props }) {
  return (
    <Tag
      className={cx('rounded-[2px] border border-primary-900/10 bg-[#fbf8f1] shadow-[0_18px_40px_-30px_rgba(17,22,31,.45)]', padded && 'p-5 sm:p-6', className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
