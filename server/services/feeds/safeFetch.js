// Every external feed call goes through this: a hard timeout + status check so
// a slow or dead upstream can never hang or crash the API. Callers catch the
// throw and fall back to cache/fixtures.
export async function safeFetch(url, { timeout = 6000 } = {}) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeout);
  try {
    const r = await fetch(url, {
      signal: ac.signal,
      headers: { "User-Agent": "SIGNAL/0.1 (portfolio demo)" },
    });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}
