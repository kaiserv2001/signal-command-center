import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import { aggregator } from "./services/feeds/aggregator.js";
import { initRealtime } from "./realtime.js";
import authRoutes from "./routes/auth.js";
import feedsRoutes from "./routes/feeds.js";
import { makeResourceRouter } from "./routes/resource.js";
import Watchpoint from "./models/Watchpoint.js";
import Note from "./models/Note.js";
import AlertRule from "./models/AlertRule.js";

const PORT = process.env.PORT || 4000;
// CLIENT_ORIGIN may be a single origin or a comma-separated list (e.g. the
// Vercel production URL + preview URLs). Empty entries are ignored.
const ALLOWED_ORIGINS = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Allow same-origin/no-origin requests (curl, health probes) and any listed
// origin. An unlisted origin is denied by omitting the CORS header (cb(null,
// false)) rather than throwing — the browser blocks it client-side, but the
// request itself never 500s.
const corsOrigin = (origin, cb) =>
  cb(null, !origin || ALLOWED_ORIGINS.includes(origin));

const app = express();
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

// Health probe — confirms the API boots.
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "signal-api", ts: Date.now() });
});

// Sprint 1 — auth.
app.use("/api/auth", authRoutes);

// Sprint 2 — live feeds + user-scoped CRUD.
app.use("/api/feeds", feedsRoutes);
app.use(
  "/api/watchpoints",
  makeResourceRouter({
    model: Watchpoint,
    fields: ["name", "lat", "lon", "radiusKm", "sources"],
    validateCreate: (d) =>
      !d.name ? "name required" : d.lat == null || d.lon == null ? "lat and lon required" : null,
  })
);
app.use(
  "/api/notes",
  makeResourceRouter({
    model: Note,
    fields: ["body", "watchpointId", "pinned"],
    validateCreate: (d) => (!d.body ? "body required" : null),
  })
);
app.use(
  "/api/alertrules",
  makeResourceRouter({
    model: AlertRule,
    fields: ["name", "source", "field", "op", "value", "watchpointId", "active"],
    validateCreate: (d) =>
      !d.name ? "name required" : !d.source ? "source required" : d.value == null ? "value required" : null,
  })
);

// Unknown API route -> JSON 404 (after all routes), so clients always get JSON.
app.use("/api", (_req, res) => res.status(404).json({ error: "not found" }));

const httpServer = http.createServer(app);

// Sprint 3 — real-time: JWT-authed sockets, feed:update broadcasts, alert:hit.
const io = new Server(httpServer, { cors: { origin: ALLOWED_ORIGINS } });
initRealtime(io);

// Graceful boot: connect to Mongo if a URI is present, but never block/crash
// the server when it is absent (intentional for the S0 skeleton).
connectDB().finally(() => {
  httpServer.listen(PORT, () => {
    console.log(`▣ SIGNAL API listening on :${PORT}`);
    aggregator.start(); // begin polling the live feeds
  });
});
