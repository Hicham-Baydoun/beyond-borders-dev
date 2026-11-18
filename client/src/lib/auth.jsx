// Holds the logged-in user. M1 will add login/logout and load the user from /auth/me.
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // user: null or { name, role: 'CUSTOMER' | 'AGENT' | 'ADMINISTRATOR' }
  const [user, setUser] = useState(null);
  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
