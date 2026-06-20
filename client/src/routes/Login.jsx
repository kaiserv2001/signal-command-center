import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, loginDemo } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await login(email, password);
      nav("/");
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function demo() {
    setErr("");
    setDemoBusy(true);
    try {
      await loginDemo();
      nav("/");
    } catch (e) {
      setErr(e.message);
    } finally {
      setDemoBusy(false);
    }
  }

  return (
    <div className="auth scanlines">
      <form className="auth-card" onSubmit={submit}>
        <h1 className="glow">SIGNAL</h1>
        <p className="auth-sub">operator access</p>
        {err && <div className="auth-err">{err}</div>}
        <label>
          EMAIL
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus required />
        </label>
        <label>
          PASSWORD
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button className="btn" disabled={busy}>{busy ? "AUTHENTICATING…" : "AUTHENTICATE"}</button>
        <div className="auth-divider"><span>OR</span></div>
        <button type="button" className="btn btn-ghost" disabled={demoBusy} onClick={demo}>
          {demoBusy ? "ENTERING…" : "▶ ENTER AS DEMO OPERATOR"}
        </button>
        <p className="auth-alt">
          No clearance? <Link to="/register">Request access</Link>
        </p>
      </form>
    </div>
  );
}
