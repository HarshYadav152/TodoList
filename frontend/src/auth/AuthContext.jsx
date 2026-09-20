import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loginRequest, logoutRequest, refreshRequest, registerRequest } from '../api/auth';
import { setAccessToken, setOnAuthFailure } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // 'loading' while we attempt a silent refresh on first load, so routes
  // don't flash the login page before we know whether the refresh cookie
  // is still valid.
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    setOnAuthFailure(() => {
      setAccessToken(null);
      setUser(null);
      setStatus('unauthenticated');
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await refreshRequest();
        setAccessToken(data.accessToken);
        setUser(decodeEmailFromToken(data.accessToken));
        setStatus('authenticated');
      } catch {
        setStatus('unauthenticated');
      }
    })();
  }, []);

  const login = async (email, password) => {
    const data = await loginRequest(email, password);
    setAccessToken(data.accessToken);
    setUser(decodeEmailFromToken(data.accessToken));
    setStatus('authenticated');
  };

  const register = async (email, password, name) => {
    const data = await registerRequest(email, password, name);
    setAccessToken(data.accessToken);
    setUser(decodeEmailFromToken(data.accessToken));
    setStatus('authenticated');
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      setAccessToken(null);
      setUser(null);
      setStatus('unauthenticated');
    }
  };

  const value = useMemo(() => ({ user, status, login, register, logout }), [user, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

// The JWT payload is not secret (it's just base64, not encrypted) — decoding
// it client-side purely to show "you as {email}" in the UI is fine. This is
// display-only; every real authorization check happens server-side.
function decodeEmailFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { email: payload.email };
  } catch {
    return null;
  }
}
