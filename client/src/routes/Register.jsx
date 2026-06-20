import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [callsign, setCallsign] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (password.length < 8) {
      setErr("password must be at least 8 characters");
      return;
    }
    setBusy(true);
    try {
      await register(email, password, callsign);
      nav("/");
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth scanlines">
      <form className="auth-card" onSubmit={submit}>
        <h1 className="glow">SIGNAL</h1>
        <p className="auth-sub">request access</p>
        {err && <div className="auth-err">{err}</div>}
        <label>
          EMAIL
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus required />
        </label>
        <label>
          CALLSIGN (OPTIONAL)
          <input type="text" value={callsign} onChange={(e) => setCallsign(e.target.value)} placeholder="GHOST" />
        </label>
        <label>
          PASSWORD (MIN 8)
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button className="btn" disabled={busy}>{busy ? "REGISTERING…" : "REQUEST ACCESS"}</button>
        <p className="auth-alt">
          Have clearance? <Link to="/login">Authenticate</Link>
        </p>
      </form>
    </div>
  );
}
