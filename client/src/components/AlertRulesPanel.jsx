import { useState } from "react";
import { api } from "../lib/api.js";
import { useCrud } from "../hooks/useCrud.js";

const SOURCES = ["quake", "aircraft", "iss", "spaceweather", "weather"];
const OPS = ["gte", "lte", "gt", "lt", "eq"];

export default function AlertRulesPanel() {
  const { items, loading, error, add, del } = useCrud({
    list: api.listAlertRules,
    create: api.createAlertRule,
    remove: api.deleteAlertRule,
  });
  const [name, setName] = useState("");
  const [source, setSource] = useState("quake");
  const [op, setOp] = useState("gte");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [formErr, setFormErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setFormErr("");
    setBusy(true);
    try {
      await add({ name, source, op, value: Number(value) });
      setName("");
      setValue("");
    } catch (e) {
      setFormErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="crud">
      <form className="crud-form" onSubmit={submit}>
        <input placeholder="rule name" value={name} onChange={(e) => setName(e.target.value)} required />
        <div className="row">
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={op} onChange={(e) => setOp(e.target.value)}>
            {OPS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <input placeholder="value" value={value} onChange={(e) => setValue(e.target.value)} required />
        </div>
        <button className="btn-sm" disabled={busy}>{busy ? "…" : "ARM RULE"}</button>
      </form>
      {formErr && <div className="auth-err">{formErr}</div>}
      {loading ? (
        <p className="muted">loading…</p>
      ) : error ? (
        <p className="muted" style={{ color: "var(--alert)" }}>ERR: {error}</p>
      ) : !items.length ? (
        <p className="muted">no rules armed</p>
      ) : (
        <ul className="crud-list">
          {items.map((r) => (
            <li key={r._id}>
              <span>
                {r.name} <span className="muted">{r.source} {r.op} {r.value}</span>
              </span>
              <button className="x" onClick={() => del(r._id)}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
