// The visitor's city, shown with a pin in the top strip.
// Default: the system location, read from the computer's time-zone setting (e.g. "Asia/Beirut" -> "Beirut").
// This needs no permission prompt and sends nothing to any outside service. A visitor's own choice is remembered.
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const KEY = 'bb-city';
const LocationContext = createContext(null);

// Cities a visitor can pick instead of the system one.
export const CITIES = ['Beirut', 'Tripoli', 'Sidon', 'Byblos', 'Dubai', 'Doha', 'Riyadh', 'Paris', 'London', 'Berlin', 'Montreal', 'Sydney'];

export function systemCity() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const city = tz.split('/').pop().replace(/_/g, ' ');
    return city && city !== 'UTC' ? city : 'Beirut';
  } catch {
    return 'Beirut';
  }
}

function readSaved() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function LocationProvider({ children }) {
  const [saved, setSaved] = useState(readSaved);
  const detected = useMemo(systemCity, []);

  const setCity = useCallback((city) => {
    setSaved(city);
    try {
      if (city) localStorage.setItem(KEY, city);
      else localStorage.removeItem(KEY);
    } catch {
      /* private mode: lasts for this visit only */
    }
  }, []);

  const value = useMemo(
    () => ({ city: saved || detected, detected, isSystem: !saved, setCity, resetToSystem: () => setCity(null) }),
    [saved, detected, setCity],
  );
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export const useLocationPref = () => useContext(LocationContext);
