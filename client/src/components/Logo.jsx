import { Link } from 'react-router-dom';
import { cx } from './ui/cx.js';

export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={cx('h-8 w-8', className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" className="fill-primary-700" />
      <circle cx="22.5" cy="10" r="3" className="fill-accent-400" />
      <path d="M5 23c4.5-6.5 9-9.5 21-11.5-6.5 3-9.5 6.5-11.5 11.5" fill="none" strokeWidth="2.6" strokeLinecap="round" className="stroke-white" />
    </svg>
  );
}

export default function Logo({ light = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-lg" aria-label="Beyond Borders home">
      <LogoMark />
      <span className={cx('text-lg font-extrabold tracking-tight', light ? 'text-white' : 'text-slate-900')}>
        Beyond<span className="text-accent-500"> Borders</span>
      </span>
    </Link>
  );
}
