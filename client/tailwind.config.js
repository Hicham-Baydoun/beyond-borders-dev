/** @type {import('tailwindcss').Config} */
// Brand theme (KAN-81, realigned to the logo in F1). Use these names in components, never raw hex values.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Logo ink (navy-black): navigation, primary buttons, links, dark sections. primary-900 is the logo colour.
        primary: {
          50: '#f4f6f9', 100: '#e6e9ef', 200: '#cbd1dc', 300: '#a3adbf', 400: '#76839c',
          500: '#556380', 600: '#424e68', 700: '#343e54', 800: '#262e40', 900: '#1b2230', 950: '#11161f',
        },
        // Brass gold: highlights and calls to action. accent-700 and darker keep white text above 4.5:1.
        accent: {
          50: '#fbf8f1', 100: '#f5eedc', 200: '#eadbb4', 300: '#ddc387', 400: '#cfa960',
          500: '#c09245', 600: '#a6783a', 700: '#865e31', 800: '#6f4d2e', 900: '#5d4129',
        },
        sand: { 50: '#fbfaf7', 100: '#f5f2ea', 200: '#ebe4d4' },
        success: { 50: '#ecfdf3', 600: '#16a34a', 700: '#15803d' },
        warning: { 50: '#fffbeb', 600: '#d97706', 700: '#b45309' },
        danger: { 50: '#fef2f2', 600: '#dc2626', 700: '#b91c1c' },
      },
      fontFamily: {
        // Display serif echoes the logo lettering; page and section headings only.
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / 0.04), 0 4px 16px -4px rgb(15 23 42 / 0.08)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: { 'fade-in': 'fade-in 150ms ease-out' },
    },
  },
  plugins: [],
};
