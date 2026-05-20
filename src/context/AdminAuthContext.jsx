import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const TOKEN_KEY = 'asse_zero_admin_jwt';

const AdminAuthContext = createContext(null);

function apiBase() {
  return (import.meta.env.VITE_AUTH_API_BASE ?? '/api/auth').replace(/\/$/, '');
}

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY));
  const [admin, setAdmin] = useState(null);
  const [status, setStatus] = useState(() => (sessionStorage.getItem(TOKEN_KEY) ? 'loading' : 'ready'));

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setAdmin(null);
  }, []);

  useEffect(() => {
    if (!token) {
      setStatus('ready');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${apiBase()}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) throw new Error('session');
        const data = await r.json();
        if (cancelled) return;
        setAdmin(data.admin);
      } catch {
        if (cancelled) return;
        clearSession();
      } finally {
        if (!cancelled) setStatus('ready');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, clearSession]);

  useEffect(() => {
    if (!token || !admin) return;
    
    let cancelled = false;
    const ping = async () => {
      try {
        await fetch(`${apiBase()}/ping`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        // Ignora errori di rete per il ping
      }
    };

    const intervalId = setInterval(() => {
      if (!cancelled) ping();
    }, 30000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [token, admin]);

  const login = useCallback(async (email, password) => {
    const r = await fetch(`${apiBase()}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      throw new Error(data.error || 'Accesso negato');
    }
    sessionStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setAdmin(data.admin);
    setStatus('ready');
  }, []);

  const logout = useCallback(async () => {
    const t = sessionStorage.getItem(TOKEN_KEY);
    if (t) {
      try {
        await fetch(`${apiBase()}/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${t}` },
        });
      } catch {
        /* rete: comunque si pulisce il client */
      }
    }
    clearSession();
    setStatus('ready');
  }, [clearSession]);

  const value = useMemo(
    () => ({
      token,
      admin,
      status,
      login,
      logout,
    }),
    [token, admin, status, login, logout],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return ctx;
}
