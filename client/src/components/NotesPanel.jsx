import { useState } from "react";
import { api } from "../lib/api.js";
import { useCrud } from "../hooks/useCrud.js";

// Mission log. Same useCrud pattern as the watchpoint/alert panels.
export default function NotesPanel() {
  const { items, loading, error, add, del } = useCrud({
    list: api.listNotes,
    create: api.createNote,
    remove: api.deleteNote,
  });
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [formErr, setFormErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setFormErr("");
    setBusy(true);
    try {
      await add({ body });
      setBody("");
    } catch (e) {
      setFormErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="crud">
      <form className="crud-form" onSubmit={submit}>
        <input placeholder="log entry…" value={body} onChange={(e) => setBody(e.target.value)} required />
        <button className="btn-sm" disabled={busy}>{busy ? "…" : "LOG NOTE"}</button>
      </form>
      {formErr && <div className="auth-err">{formErr}</div>}
      {loading ? (
        <p className="muted">loading…</p>
      ) : error ? (
        <p className="muted" style={{ color: "var(--alert)" }}>ERR: {error}</p>
      ) : !items.length ? (
        <p className="muted">no notes logged</p>
      ) : (
        <ul className="crud-list">
          {items.map((n) => (
            <li key={n._id}>
              <span>{n.body}</span>
              <button className="x" onClick={() => del(n._id)}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
