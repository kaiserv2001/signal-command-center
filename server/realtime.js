import jwt from "jsonwebtoken";
import { aggregator } from "./services/feeds/aggregator.js";
import { evaluateAlerts } from "./services/alerts.js";

// userId -> active socket count (so alerts only evaluate for online operators).
const connected = new Map();

const SOURCES = ["quake", "aircraft", "iss", "spaceweather"];

export function initRealtime(io) {
  // Handshake auth: same JWT as the REST API, passed via socket.handshake.auth.token.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("no token"));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.userId = payload.id;
      next();
    } catch {
      next(new Error("bad token"));
    }
  });

  io.on("connection", (socket) => {
    const uid = socket.data.userId;
    socket.join(`user:${uid}`); // private room for this user's alerts
    connected.set(uid, (connected.get(uid) || 0) + 1);

    // Seed the client with the current cache using the same event it listens to
    // for deltas, so there's one render path.
    for (const source of SOURCES) {
      const events = aggregator.getBySource(source);
      if (events.length) socket.emit("feed:update", { source, events });
    }

    socket.on("disconnect", () => {
      const n = (connected.get(uid) || 1) - 1;
      if (n <= 0) connected.delete(uid);
      else connected.set(uid, n);
    });
  });

  // On every source refresh: broadcast the delta and evaluate alerts.
  aggregator.onUpdate = (source, events) => {
    io.emit("feed:update", { source, events });
    const uids = [...connected.keys()];
    if (uids.length) {
      evaluateAlerts(io, source, events, uids).catch((e) =>
        console.warn(`⚠ alert eval (${source}): ${e.message}`)
      );
    }
  };
}
