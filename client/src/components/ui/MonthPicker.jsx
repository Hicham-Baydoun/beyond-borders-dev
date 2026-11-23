// Month picker that matches the brand (the browser's own month popup cannot be styled).
// value / onChange use the same "YYYY-MM" format as <input type="month">, or '' for any month.
// Months before the current one are disabled. Closes on Escape, outside click or selection.
import { useEffect, useId, useRef, useState } from 'react';
import { cx } from './cx.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const YEARS_AHEAD = 2;

const parse = (v) => (v && /^\d{4}-\d{2}$/.test(v) ? { y: Number(v.slice(0, 4)), m: Number(v.slice(5)) - 1 } : null);
const fmt = (y, m) => `${y}-${String(m + 1).padStart(2, '0')}`;

export default function MonthPicker({ id, value, onChange, placeholder = 'Any month', className, buttonClassName }) {
  const autoId = useId();
  const btnId = id || autoId;
  const popId = `${btnId}-popup`;
  const today = new Date();
  const nowY = today.getFullYear();
  const nowM = today.getMonth();
  const selected = parse(value);

  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(selected?.y ?? nowY);
  const root = useRef(null);
  const btn = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => !root.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btn.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => {
    setYear(selected?.y ?? nowY);
    setOpen((o) => !o);
  };
  const pick = (v) => {
    onChange(v);
    setOpen(false);
    btn.current?.focus();
  };

  return (
    <div ref={root} className={cx('relative', className)}>
      <button
        ref={btn}
        id={btnId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popId : undefined}
        onClick={toggle}
        className={cx('flex w-full items-center justify-between gap-3 text-left', buttonClassName)}
      >
        <span className={selected ? '' : 'text-primary-400'}>
          {selected ? `${LONG[selected.m]} ${selected.y}` : placeholder}
        </span>
        <svg viewBox="0 0 20 20" className={cx('h-4 w-4 shrink-0 text-primary-400 transition-transform duration-200', open && 'rotate-180')} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M5 8l5 5 5-5" />
        </svg>
      </button>

      {open && (
        <div
          id={popId}
          role="dialog"
          aria-label="Choose a month"
          className="absolute left-0 top-full z-50 mt-3 w-[17.5rem] origin-top animate-pop-in border border-primary-900/10 bg-surface p-4 font-sans shadow-pop"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous year"
              disabled={year <= nowY}
              onClick={() => setYear((y) => y - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-primary-600 transition-colors hover:bg-primary-900/5 disabled:opacity-25"
            >
              ‹
            </button>
            <span className="font-display text-2xl text-primary-900" aria-live="polite">{year}</span>
            <button
              type="button"
              aria-label="Next year"
              disabled={year >= nowY + YEARS_AHEAD}
              onClick={() => setYear((y) => y + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-primary-600 transition-colors hover:bg-primary-900/5 disabled:opacity-25"
            >
              ›
            </button>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-1">
            {MONTHS.map((label, m) => {
              const past = year < nowY || (year === nowY && m < nowM);
              const isSel = selected?.y === year && selected?.m === m;
              const isNow = year === nowY && m === nowM;
              return (
                <button
                  key={label}
                  type="button"
                  disabled={past}
                  aria-pressed={isSel}
                  aria-label={`${LONG[m]} ${year}`}
                  onClick={() => pick(fmt(year, m))}
                  className={cx(
                    'relative h-10 text-[0.72rem] font-medium uppercase tracking-[0.14em] transition-colors duration-150',
                    isSel
                      ? 'bg-primary-900 text-paper'
                      : past
                        ? 'cursor-not-allowed text-primary-300 line-through decoration-primary-300/60'
                        : 'text-primary-800 hover:bg-accent-500/15',
                  )}
                >
                  {label}
                  {isNow && !isSel && <span className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent-600" aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-primary-900/10 pt-3 text-[0.65rem] font-medium uppercase tracking-[0.2em]">
            <button type="button" onClick={() => pick('')} className="text-primary-500 hover:text-primary-900">Any month</button>
            <button type="button" onClick={() => pick(fmt(nowY, nowM))} className="text-accent-700 hover:text-accent-800">This month</button>
          </div>
        </div>
      )}
    </div>
  );
}
