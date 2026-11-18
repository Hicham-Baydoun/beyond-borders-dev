/** @type {import('tailwindcss').Config} */
// Brand theme (KAN-81). Use these names in components, never raw hex values.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep ocean teal: navigation, primary buttons, links
        primary: {
          50: '#effaf9', 100: '#d6f1ee', 200: '#addfdb', 300: '#7cc7c2', 400: '#4aa9a5',
          500: '#2f8d8a', 600: '#23716f', 700: '#1f5b5a', 800: '#1c4a4a', 900: '#173c3d', 950: '#0b2526',
        },
        // Sunset coral: highlights and calls to action on dark backgrounds
        accent: {
          50: '#fff4ef', 100: '#ffe6db', 200: '#ffc9b2', 300: '#ffa47f', 400: '#fb7a4b',
          500: '#f25a27', 600: '#df411b', 700: '#b93118', 800: '#932a1a', 900: '#772618',
        },
        sand: { 50: '#fbfaf7', 100: '#f5f2ea', 200: '#ebe4d4' },
        success: { 50: '#ecfdf3', 600: '#16a34a', 700: '#15803d' },
        warning: { 50: '#fffbeb', 600: '#d97706', 700: '#b45309' },
        danger: { 50: '#fef2f2', 600: '#dc2626', 700: '#b91c1c' },
      },
      fontFamily: {
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
