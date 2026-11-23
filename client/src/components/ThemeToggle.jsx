// Three-way theme switch: System, Light, Dark. A small segmented control with icons and labels for screen readers.
import { useTheme } from '../lib/theme.jsx';
import { cx } from './ui';

const options = [
  {
    value: 'system',
    label: 'Use system theme',
    icon: <path d="M4 5h16v11H4zM9 20h6M12 16v4" />,
  },
  {
    value: 'light',
    label: 'Light theme',
    icon: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
  },
  {
    value: 'dark',
    label: 'Dark theme',
    icon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />,
  },
];

export default function ThemeToggle({ className }) {
  const { pref, setPref } = useTheme();
  return (
    <div role="radiogroup" aria-label="Colour theme" className={cx('inline-flex items-center rounded-full border border-primary-900/15 p-0.5', className)}>
      {options.map((o) => {
        const active = pref === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={o.label}
            title={o.label}
            onClick={() => setPref(o.value)}
            className={cx(
              'flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200',
              active ? 'bg-primary-900 text-paper' : 'text-primary-500 hover:text-primary-900',
            )}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {o.icon}
            </svg>
          </button>
        );
      })}
    </div>
  );
}
