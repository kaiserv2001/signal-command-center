import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken, clearToken } from "../lib/api.js";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On boot, if we have a stored token, validate it via /me.
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then((d) => setUser(d.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const d = await api.login(email, password);
    setToken(d.token);
    setUser(d.user);
    return d;
  }

  async function register(email, password, callsign) {
    const d = await api.register(email, password, callsign);
    setToken(d.token);
    setUser(d.user);
    return d;
  }

  async function loginDemo() {
    const d = await api.demo();
    setToken(d.token);
    setUser(d.user);
    return d;
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, loginDemo, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
