// REST client. In dev, VITE_API_URL is unset so paths are relative and Vite's
// proxy forwards /api -> the server (no CORS). In prod, VITE_API_URL is the
// deployed API origin.
const BASE = import.meta.env.VITE_API_URL || "";
const TOKEN_KEY = "signal_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `request failed (${res.status})`);
  return data;
}

export const api = {
  request,
  register: (email, password, callsign) =>
    request("/api/auth/register", { method: "POST", body: { email, password, callsign }, auth: false }),
  login: (email, password) =>
    request("/api/auth/login", { method: "POST", body: { email, password }, auth: false }),
  demo: () => request("/api/auth/demo", { method: "POST", auth: false }),
  me: () => request("/api/auth/me"),
  feeds: () => request("/api/feeds", { auth: false }),
  // CRUD helpers (used from Sprint 5)
  listWatchpoints: () => request("/api/watchpoints"),
  createWatchpoint: (wp) => request("/api/watchpoints", { method: "POST", body: wp }),
  deleteWatchpoint: (id) => request(`/api/watchpoints/${id}`, { method: "DELETE" }),
  listNotes: () => request("/api/notes"),
  createNote: (n) => request("/api/notes", { method: "POST", body: n }),
  deleteNote: (id) => request(`/api/notes/${id}`, { method: "DELETE" }),
  listAlertRules: () => request("/api/alertrules"),
  createAlertRule: (r) => request("/api/alertrules", { method: "POST", body: r }),
  deleteAlertRule: (id) => request(`/api/alertrules/${id}`, { method: "DELETE" }),
};
