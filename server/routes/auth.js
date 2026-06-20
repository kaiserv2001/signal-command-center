import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Watchpoint from "../models/Watchpoint.js";
import AlertRule from "../models/AlertRule.js";
import { auth, signToken } from "../middleware/auth.js";

const router = Router();

const emailOk = (e) => typeof e === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

const DEMO_EMAIL = "demo@signal.io";

// POST /api/auth/register -> { token, user }
router.post("/register", async (req, res) => {
  try {
    const { email, password, callsign } = req.body || {};
    if (!emailOk(email)) return res.status(400).json({ error: "valid email required" });
    if (!password || password.length < 8)
      return res.status(400).json({ error: "password must be at least 8 characters" });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: "email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, callsign: callsign || "" });
    return res.status(201).json({ token: signToken(user), user: user.toSafeJSON() });
  } catch (err) {
    return res.status(500).json({ error: "registration failed" });
  }
});

// POST /api/auth/login -> { token, user }
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!emailOk(email) || !password)
      return res.status(400).json({ error: "email and password required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    // Same response whether the email is unknown or the password is wrong,
    // so we don't reveal which accounts exist.
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ error: "invalid credentials" });

    return res.json({ token: signToken(user), user: user.toSafeJSON() });
  } catch (err) {
    return res.status(500).json({ error: "login failed" });
  }
});

// GET /api/auth/me -> current user (protected) — used to verify a stored token.
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "user not found" });
  return res.json({ user: user.toSafeJSON() });
});

// POST /api/auth/demo -> { token, user }
// One-click guest access. Ensures the shared demo account exists (seeding a
// sample watchpoint + alert rule on first creation so the HUD looks alive) and
// returns a token. The demo password is random/unusable, so the account can't
// be logged into via the normal form.
router.post("/demo", async (_req, res) => {
  try {
    let user = await User.findOne({ email: DEMO_EMAIL });
    if (!user) {
      const passwordHash = await bcrypt.hash(`demo-${Math.random().toString(36).slice(2)}`, 10);
      user = await User.create({ email: DEMO_EMAIL, passwordHash, callsign: "DEMO" });
      try {
        const wp = await Watchpoint.create({
          userId: user._id,
          name: "San Andreas",
          lat: 37.0,
          lon: -122.0,
          radiusKm: 500,
          sources: ["quake"],
        });
        await AlertRule.create({
          userId: user._id,
          name: "Major quake watch",
          source: "quake",
          op: "gte",
          value: 4,
          watchpointId: wp._id,
        });
      } catch {
        /* seeding is best-effort; demo login still works without it */
      }
    }
    return res.json({ token: signToken(user), user: user.toSafeJSON() });
  } catch (err) {
    return res.status(500).json({ error: "demo login failed" });
  }
});

export default router;
