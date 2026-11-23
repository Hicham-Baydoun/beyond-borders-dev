// "⋮" settings menu in the header: appearance (system, light, dark) and location.
import { useEffect, useId, useRef, useState } from 'react';
import { useTheme } from '../lib/theme.jsx';
import { CITIES, useLocationPref } from '../lib/location.jsx';
import { cx } from './ui';

const Icon = ({ children, className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const PinIcon = (props) => (
  <Icon {...props}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21Z" />
    <circle cx="12" cy="10" r="2.3" />
  </Icon>
);

const themes = [
  { value: 'system', label: 'System', icon: <path d="M4 5h16v11H4zM9 20h6M12 16v4" /> },
  {
    value: 'light',
    label: 'Light',
    icon: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
  },
  { value: 'dark', label: 'Dark', icon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" /> },
];

const heading = 'text-[0.6rem] font-medium uppercase tracking-[0.28em] text-primary-500';

export default function SettingsMenu({ className }) {
  const { pref, setPref } = useTheme();
  const { city, detected, isSystem, setCity, resetToSystem } = useLocationPref();
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const btn = useRef(null);
  const panelId = useId();
  const cityId = useId();

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

  const cityOptions = CITIES.includes(detected) ? CITIES : [detected, ...CITIES];

  return (
    <div ref={root} className={cx('relative', className)}>
      <button
        ref={btn}
        type="button"
        aria-label="Settings"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((o) => !o)}
        className={cx(
          'flex h-10 w-10 items-center justify-center rounded-full text-primary-700 transition-colors hover:bg-primary-900/5 hover:text-primary-900',
          open && 'bg-primary-900/5 text-primary-900',
        )}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="5" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="12" cy="19" r="1.7" />
        </svg>
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Settings"
          className="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right animate-pop-in border border-primary-900/10 bg-surface p-4 shadow-pop"
        >
          <p className={heading}>Appearance</p>
          <div role="radiogroup" aria-label="Colour theme" className="mt-3 grid grid-cols-3 gap-1.5">
            {themes.map((t) => {
              const active = pref === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setPref(t.value)}
                  className={cx(
                    'flex flex-col items-center gap-1.5 border py-2.5 text-[0.65rem] font-medium uppercase tracking-[0.16em] transition-colors',
                    active
                      ? 'border-primary-900 bg-primary-900 text-paper'
                      : 'border-primary-900/15 text-primary-700 hover:border-primary-900/40',
                  )}
                >
                  <Icon>{t.icon}</Icon>
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="rule my-4" />

          <label htmlFor={cityId} className={heading}>Location</label>
          <div className="mt-3 flex items-center gap-2 border border-primary-900/15 px-3 py-2 focus-within:border-primary-900/50">
            <PinIcon className="h-4 w-4 shrink-0 text-accent-700" />
            <select
              id={cityId}
              value={city}
              onChange={(e) => (e.target.value === detected ? resetToSystem() : setCity(e.target.value))}
              className="w-full border-0 bg-transparent p-0 text-sm text-primary-900 focus:outline-none focus:ring-0"
            >
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}{c === detected ? ' (system)' : ''}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-2 text-xs text-primary-500">
            {isSystem ? 'Detected from your system settings.' : (
              <>
                Chosen by you.{' '}
                <button type="button" onClick={resetToSystem} className="font-medium text-accent-700 underline-offset-2 hover:underline">
                  Use system location
                </button>
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
