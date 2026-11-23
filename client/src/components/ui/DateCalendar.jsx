// Date picker that matches the brand (the browser's own date popup cannot be styled).
// value / onChange use "YYYY-MM-DD" (same as <input type="date">), or '' for any date.
// Past days are disabled, today is outlined, and `marked` dates (e.g. departures) get a gold dot.
// Keyboard: arrow keys move between days, PageUp / PageDown change month, Escape closes.
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cx } from './cx.js';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MAX_MONTHS_AHEAD = 24;

const pad = (n) => String(n).padStart(2, '0');
const iso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const parse = (v) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? { y: +v.slice(0, 4), m: +v.slice(5, 7) - 1, d: +v.slice(8) } : null);
const daysIn = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
const mondayIndex = (y, m) => (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7;
const label = (p) => new Date(Date.UTC(p.y, p.m, p.d)).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export default function DateCalendar({ id, value, onChange, marked = [], placeholder = 'Any date', buttonClassName, className }) {
  const autoId = useId();
  const btnId = id || autoId;
  const popId = `${btnId}-popup`;
  const now = new Date();
  const today = { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() };
  const todayIso = iso(today.y, today.m, today.d);
  const selected = parse(value);
  const markedSet = useMemo(() => new Set(marked), [marked]);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ y: today.y, m: today.m });
  const [focusIso, setFocusIso] = useState(null);
  const root = useRef(null);
  const btn = useRef(null);
  const grid = useRef(null);

  const monthOffset = (view.y - today.y) * 12 + (view.m - today.m);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => !root.current?.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // Keep keyboard focus on the active day as it moves.
  useEffect(() => {
    if (open && focusIso) grid.current?.querySelector(`[data-iso="${focusIso}"]`)?.focus();
  }, [open, focusIso, view]);

  const toggle = () => {
    const start = selected ?? today;
    setView({ y: start.y, m: start.m });
    setFocusIso(null);
    setOpen((o) => !o);
  };
  const close = () => {
    setOpen(false);
    btn.current?.focus();
  };
  const pick = (v) => {
    onChange(v);
    close();
  };
  const shiftMonth = (delta) =>
    setView((v) => {
      const t = v.y * 12 + v.m + delta;
      return { y: Math.floor(t / 12), m: t % 12 };
    });

  const onKeyDown = (e) => {
    if (e.key === 'Escape') return close();
    const cur = parse(focusIso ?? value) ?? today;
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    let next;
    if (step) next = new Date(Date.UTC(cur.y, cur.m, cur.d + step));
    else if (e.key === 'PageUp' || e.key === 'PageDown') next = new Date(Date.UTC(cur.y, cur.m + (e.key === 'PageDown' ? 1 : -1), Math.min(cur.d, 28)));
    if (!next) return undefined;
    e.preventDefault();
    const n = iso(next.getUTCFullYear(), next.getUTCMonth(), next.getUTCDate());
    if (n < todayIso) return undefined;
    setView({ y: next.getUTCFullYear(), m: next.getUTCMonth() });
    setFocusIso(n);
    return undefined;
  };

  const lead = mondayIndex(view.y, view.m);
  const total = daysIn(view.y, view.m);
  const cells = [...Array(lead).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];

  // Exactly one day in the visible month takes the Tab stop: the focused day, else the chosen one,
  // else today, else the first day that is not in the past.
  const inView = (d) => d && d.startsWith(`${view.y}-${pad(view.m + 1)}-`) && d >= todayIso;
  const firstOpen = Array.from({ length: total }, (_, i) => iso(view.y, view.m, i + 1)).find((d) => d >= todayIso);
  const tabStop = [focusIso, value, todayIso].find(inView) ?? firstOpen;

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
        <span className={selected ? '' : 'text-primary-400'}>{selected ? label(selected) : placeholder}</span>
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-primary-400" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="15" rx="1" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
      </button>

      {open && (
        <div
          id={popId}
          role="dialog"
          aria-label="Choose a departure date"
          onKeyDown={onKeyDown}
          className="absolute left-0 top-full z-50 mt-3 w-[19.5rem] origin-top animate-pop-in border border-primary-900/10 bg-surface p-4 font-sans shadow-pop"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              disabled={monthOffset <= 0}
              onClick={() => shiftMonth(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-primary-600 transition-colors hover:bg-primary-900/5 disabled:opacity-25"
            >
              ‹
            </button>
            <p className="font-display text-xl text-primary-900" aria-live="polite">
              {MONTHS[view.m]} <span className="text-primary-500">{view.y}</span>
            </p>
            <button
              type="button"
              aria-label="Next month"
              disabled={monthOffset >= MAX_MONTHS_AHEAD}
              onClick={() => shiftMonth(1)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-primary-600 transition-colors hover:bg-primary-900/5 disabled:opacity-25"
            >
              ›
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 text-center text-[0.6rem] font-medium uppercase tracking-[0.16em] text-primary-500" aria-hidden="true">
            {WEEKDAYS.map((w) => <span key={w} className="py-1.5">{w}</span>)}
          </div>

          <div ref={grid} role="grid" aria-label={`${MONTHS[view.m]} ${view.y}`} className="grid grid-cols-7 gap-y-0.5">
            {cells.map((d, i) => {
              if (!d) return <span key={`e${i}`} />;
              const dayIso = iso(view.y, view.m, d);
              const past = dayIso < todayIso;
              const isSel = value === dayIso;
              const isToday = dayIso === todayIso;
              const hasTrip = markedSet.has(dayIso);
              const tabbable = dayIso === tabStop;
              return (
                <button
                  key={dayIso}
                  type="button"
                  data-iso={dayIso}
                  disabled={past}
                  tabIndex={tabbable ? 0 : -1}
                  aria-pressed={isSel}
                  aria-label={`${label({ y: view.y, m: view.m, d })}${hasTrip ? ', departure available' : ''}`}
                  onClick={() => pick(dayIso)}
                  onFocus={() => setFocusIso(dayIso)}
                  className={cx(
                    'relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm tabular-nums transition-colors duration-150',
                    isSel
                      ? 'bg-primary-900 text-paper'
                      : past
                        ? 'cursor-not-allowed text-primary-300'
                        : cx('text-primary-800 hover:bg-accent-500/15', isToday && 'ring-1 ring-inset ring-primary-900/40'),
                  )}
                >
                  {d}
                  {hasTrip && !past && (
                    <span className={cx('absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full', isSel ? 'bg-accent-300' : 'bg-accent-600')} aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-primary-900/10 pt-3 text-[0.65rem] font-medium uppercase tracking-[0.2em]">
            <button type="button" onClick={() => pick('')} className="text-primary-500 hover:text-primary-900">Any date</button>
            {marked.length > 0 && (
              <span className="flex items-center gap-1.5 normal-case tracking-normal text-primary-500">
                <span className="h-1 w-1 rounded-full bg-accent-600" aria-hidden="true" /> Departure
              </span>
            )}
            <button type="button" onClick={() => pick(todayIso)} className="text-accent-700 hover:text-accent-800">Today</button>
          </div>
        </div>
      )}
    </div>
  );
}
