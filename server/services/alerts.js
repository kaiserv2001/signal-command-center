import AlertRule from "../models/AlertRule.js";
import Watchpoint from "../models/Watchpoint.js";

const OPS = {
  gte: (a, b) => a >= b,
  lte: (a, b) => a <= b,
  gt: (a, b) => a > b,
  lt: (a, b) => a < b,
  eq: (a, b) => a === b,
};

// Great-circle distance in km — used for the optional watchpoint geofence.
function haversineKm(aLat, aLon, bLat, bLon) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Dedupe: a given (rule, event) pair should alert once, not every refresh.
const fired = new Set();

// Called on each source refresh. Evaluates that source's events against the
// active rules of currently-connected users and emits alert:hit to the owner's
// room. Scoping to connected users avoids work for operators who aren't online.
export async function evaluateAlerts(io, source, events, connectedUserIds) {
  if (!events.length || !connectedUserIds.length) return;

  const rules = await AlertRule.find({
    source,
    active: true,
    userId: { $in: connectedUserIds },
  });
  if (!rules.length) return;

  // Preload any watchpoints the rules geofence against.
  const wpIds = [...new Set(rules.map((r) => r.watchpointId).filter(Boolean).map(String))];
  const wps = wpIds.length ? await Watchpoint.find({ _id: { $in: wpIds } }) : [];
  const wpById = new Map(wps.map((w) => [String(w._id), w]));

  for (const rule of rules) {
    const cmp = OPS[rule.op] || OPS.gte;
    const wp = rule.watchpointId ? wpById.get(String(rule.watchpointId)) : null;

    for (const ev of events) {
      if (ev.magnitude == null || !cmp(ev.magnitude, rule.value)) continue;
      if (wp && ev.lat != null && ev.lon != null) {
        if (haversineKm(wp.lat, wp.lon, ev.lat, ev.lon) > (wp.radiusKm || 200)) continue;
      }
      const key = `${rule._id}:${ev.id}`;
      if (fired.has(key)) continue;
      fired.add(key);
      io.to(`user:${rule.userId}`).emit("alert:hit", { rule: rule.toJSON(), event: ev });
    }
  }

  if (fired.size > 5000) fired.clear(); // keep the dedupe set bounded
}
