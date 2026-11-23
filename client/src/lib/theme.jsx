// Light / dark mode. Default is the system setting; a visitor's choice is remembered in this browser.
// index.html applies the saved theme before React loads, so the page never flashes the wrong colours.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'bb-theme'; // 'system' | 'light' | 'dark'
const ThemeContext = createContext(null);
const media = () => window.matchMedia('(prefers-color-scheme: dark)');

function readPref() {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

export function ThemeProvider({ children }) {
  const [pref, setPrefState] = useState(readPref);
  const [systemDark, setSystemDark] = useState(() => media().matches);

  useEffect(() => {
    const m = media();
    const onChange = (e) => setSystemDark(e.matches);
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, []);

  const theme = pref === 'system' ? (systemDark ? 'dark' : 'light') : pref;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setPref = useCallback((next) => {
    setPrefState(next);
    try {
      if (next === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {
      /* private mode: the choice lasts for this visit only */
    }
  }, []);

  const value = useMemo(() => ({ pref, theme, setPref }), [pref, theme, setPref]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
