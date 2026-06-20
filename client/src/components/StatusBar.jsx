// Top HUD readout: operator identity, live contact count, space-weather status,
// sign-out. The Kp status reads the (null-coord) spaceweather event.
export default function StatusBar({ user, events = [], kp, connected, onLogout }) {
  const contacts = events.filter((e) => e.lat != null && e.lon != null).length;
  return (
    <div className="statusbar">
      <span className="brand glow">SIGNAL</span>
      <span className={connected ? "link-dot" : "link-off"}>{connected ? "● LIVE" : "○ OFFLINE"}</span>
      <span className="sep">//</span>
      <span>OP: {user?.callsign || user?.email || "—"}</span>
      <span className="sep">//</span>
      <span>CONTACTS: {contacts}</span>
      {kp != null && (
        <>
          <span className="sep">//</span>
          <span style={{ color: kp >= 5 ? "var(--alert)" : "var(--fg-dim)" }}>KP: {kp}</span>
        </>
      )}
      <span className="grow" />
      <button className="btn-sm" onClick={onLogout}>
        SIGN OUT
      </button>
    </div>
  );
}
