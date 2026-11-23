// Holds the logged-in user, loaded from /auth/me when the app starts (FR-ACC-03).
// user: null or { kind, id, role: 'CUSTOMER' | 'AGENT' | 'ADMINISTRATOR', name, email }
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from './api.js';

const AuthContext = createContext(null);

// Where each role lands after login (TC-ACC-03-01). Defined with the menus in config/menus.js.
export { roleHome } from '../config/menus.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Bumped by every login and logout, so a slow startup /auth/me can't overwrite their result.
  const version = useRef(0);

  useEffect(() => {
    const started = version.current;
    api('/auth/me')
      .then((r) => version.current === started && setUser(r.user))
      .catch(() => version.current === started && setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: u } = await api('/auth/login', { method: 'POST', body: { email, password } });
    version.current += 1; // only a successful login supersedes the startup check
    setUser(u);
    return u;
  }, []);

  // Clears the user only once the server has ended the session. On failure it throws, so the caller
  // can tell the user (otherwise someone on a shared computer would think they were logged out).
  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' });
    version.current += 1;
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout, setUser }), [user, loading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
