import { useState } from "react";
import { api } from "../lib/api.js";
import { useCrud } from "../hooks/useCrud.js";

export default function WatchpointsPanel() {
  const { items, loading, error, add, del } = useCrud({
    list: api.listWatchpoints,
    create: api.createWatchpoint,
    remove: api.deleteWatchpoint,
  });
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [busy, setBusy] = useState(false);
  const [formErr, setFormErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setFormErr("");
    setBusy(true);
    try {
      await add({ name, lat: Number(lat), lon: Number(lon) });
      setName("");
      setLat("");
      setLon("");
    } catch (e) {
      setFormErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="crud">
      <form className="crud-form" onSubmit={submit}>
        <input placeholder="name" value={name} onChange={(e) => setName(e.target.value)} required />
        <div className="row">
          <input placeholder="lat" value={lat} onChange={(e) => setLat(e.target.value)} required />
          <input placeholder="lon" value={lon} onChange={(e) => setLon(e.target.value)} required />
        </div>
        <button className="btn-sm" disabled={busy}>{busy ? "…" : "ADD WATCHPOINT"}</button>
      </form>
      {formErr && <div className="auth-err">{formErr}</div>}
      {loading ? (
        <p className="muted">loading…</p>
      ) : error ? (
        <p className="muted" style={{ color: "var(--alert)" }}>ERR: {error}</p>
      ) : !items.length ? (
        <p className="muted">no watchpoints</p>
      ) : (
        <ul className="crud-list">
          {items.map((w) => (
            <li key={w._id}>
              <span>
                {w.name} <span className="muted">[{w.lat.toFixed(1)},{w.lon.toFixed(1)}]</span>
              </span>
              <button className="x" onClick={() => del(w._id)}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
