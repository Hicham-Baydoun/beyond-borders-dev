import { useId } from 'react';
import { Link } from 'react-router-dom';
import { cx } from './ui/cx.js';

// Small mark: the globe and orbit swoosh from the full logo (public/brand/beyond-borders-logo.png).
// Drawn in currentColor, so it works on light and dark backgrounds. Same shape as public/brand/globe-mark.svg.
const ORBIT = 'M3 54A31 10 -25 0 0 61 27A31 6.5 -25 0 1 3 54Z';

export function LogoMark({ className }) {
  const maskId = `bb-orbit-gap-${useId().replace(/:/g, '')}`;
  return (
    <svg viewBox="0 0 64 64" className={cx('h-9 w-9', className)} aria-hidden="true" fill="currentColor">
      <defs>
        <mask id={maskId}>
          <rect width="64" height="64" fill="#fff" />
          <path d={ORBIT} stroke="#000" strokeWidth="5" strokeLinejoin="round" />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        <circle cx="34" cy="30" r="19" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M19 23C20 17 26 14 33 13C38 13 43 15 45 18L41 20C40 23 38 25 36 26C35 28 37 29 36 31C33 30 31 29 29 30C27 28 25 27 23 27C21 26 19 25 19 23Z" />
        <path d="M33 33C36 32 41 34 43 37C44 40 42 43 40 46C38 48 37 50 36 50C35 46 34 42 33 39C32 37 32 35 33 33Z" />
      </g>
      <path d={ORBIT} />
    </svg>
  );
}

// Wordmark in the logo's serif capitals. `tagline` adds the logo's strapline (footer, auth pages).
export default function Logo({ light = false, tagline = false }) {
  const ink = light ? 'text-white' : 'text-primary-900';
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-lg" aria-label="Beyond Borders home">
      <LogoMark className={ink} />
      <span className="flex flex-col leading-none">
        <span className={cx('font-display text-lg font-semibold uppercase tracking-[0.12em]', ink)}>
          Beyond Borders
        </span>
        {tagline && (
          <span className={cx('mt-1.5 text-[0.6rem] font-medium uppercase tracking-[0.22em]', light ? 'text-primary-200' : 'text-primary-500')}>
            Where dreams travel further
          </span>
        )}
      </span>
    </Link>
  );
}
