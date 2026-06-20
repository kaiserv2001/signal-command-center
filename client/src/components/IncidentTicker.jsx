// Newest-first list of incoming signal events. Distinguishes "quiet feed" from
// "uplink lost" so the operator knows whether it's standing by or broken.
export default function IncidentTicker({ events = [], offline }) {
  if (!events.length) {
    return (
      <p className="muted" style={offline ? { color: "var(--alert)" } : undefined}>
        {offline ? "⚠ FEED OFFLINE · reconnecting…" : "NO SIGNAL · awaiting uplink"}
      </p>
    );
  }
  const sorted = [...events].sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 40);
  return (
    <ul className="ticker">
      {sorted.map((e) => (
        <li key={e.id} className={`tick tick-${e.source}`}>
          <span className="tick-src">{e.source.toUpperCase()}</span>
          <span className="tick-title">{e.title}</span>
        </li>
      ))}
    </ul>
  );
}
