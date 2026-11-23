/** @type {import('tailwindcss').Config} */
// Brand theme (KAN-81). Use these names in components, never raw hex values.
// Every colour is a CSS variable from src/index.css, so light and dark mode switch without `dark:` classes.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
const scale = (prefix, steps) => Object.fromEntries(steps.map((s) => [s, v(`${prefix}-${s}`)]));
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const ink = scale('ink', STEPS);

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Logo ink. Text and lines: higher number = stronger. Flips to warm cream in dark mode.
        primary: ink,
        // Older components use slate; it points at the same themed scale so they follow dark mode too.
        slate: ink,
        // Brass gold. Higher number = stronger contrast against the page in both themes.
        accent: scale('brass', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),
        // Page background, banded sections and raised surfaces (cards, boarding pass).
        paper: { DEFAULT: v('paper'), dark: v('paper-dark') },
        surface: v('surface'),
        bezel: v('bezel'),
        // Always-dark bands (announcement strip, departures board, footer) in both themes.
        night: v('night'),
        sand: { 50: v('paper'), 100: v('paper-dark'), 200: v('bezel') },
        success: { 50: v('success-50'), 600: v('success-600'), 700: v('success-700') },
        warning: { 50: v('warning-50'), 600: v('warning-600'), 700: v('warning-700') },
        danger: { 50: v('danger-50'), 600: v('danger-600'), 700: v('danger-700') },
      },
      fontFamily: {
        // Display serif echoes the logo lettering; page and section headings only.
        display: ['"Bodoni Moda"', 'Didot', 'Georgia', 'serif'],
        // Geometric sans like the logo tagline.
        sans: ['Jost', 'Futura', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 18px 40px -30px rgb(var(--shadow) / 0.45)',
        pop: '0 24px 50px -24px rgb(var(--shadow) / 0.55)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'none' } },
        'pop-in': { from: { opacity: 0, transform: 'translateY(-6px) scale(.98)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: { 'fade-in': 'fade-in 150ms ease-out', 'pop-in': 'pop-in 180ms cubic-bezier(.2,.8,.2,1)' },
    },
  },
  plugins: [],
};
