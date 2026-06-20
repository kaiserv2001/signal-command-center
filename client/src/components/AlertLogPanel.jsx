import { useFeedStore } from "../store/feedStore.js";

function ago(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h`;
}

// Persisted alert history — survives page refresh (localStorage). This is the
// record; toasts are just the flash.
export default function AlertLogPanel() {
  const log = useFeedStore((s) => s.alertLog);
  const clear = useFeedStore((s) => s.clearAlertLog);

  if (!log.length) return <p className="muted">no alerts logged</p>;
  return (
    <div className="crud">
      <button className="btn-sm" style={{ marginBottom: 6 }} onClick={clear}>
        CLEAR LOG
      </button>
      <ul className="crud-list">
        {log.map((a) => (
          <li key={a.id}>
            <span>
              <span className="tick-src" style={{ color: "var(--alert)" }}>{a.source.toUpperCase()}</span>{" "}
              {a.ruleName} <span className="muted">· {a.title}</span>
            </span>
            <span className="muted">{ago(a.ts)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
