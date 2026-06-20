# SIGNAL API Contract

> **This file is the single source of truth for cross-boundary shapes.** Frontend hooks and integration-QA read it. Producers update it on any change.

Base URL (dev): `http://localhost:4000` · all bodies JSON · auth via `Authorization: Bearer <token>`.

---

## Auth  (Sprint 1)

### `POST /api/auth/register`
Body: `{ email, password, callsign? }` — password ≥ 8 chars.
- `201` → `{ token, user }`
- `400` invalid email / short password · `409` email already registered

### `POST /api/auth/login`
Body: `{ email, password }`
- `200` → `{ token, user }`
- `401` invalid credentials (same response for unknown email or wrong password)

### `GET /api/auth/me`  *(protected)*
Header: `Authorization: Bearer <token>`
- `200` → `{ user }` · `401` no/bad token

### `POST /api/auth/demo`
One-click guest access. Ensures the shared `demo@signal.io` account exists (seeds a sample watchpoint + alert rule on first creation) and returns a token. No body. Password is random/unusable, so the demo account can't be reached via `/login`.
- `200` → `{ token, user }`

### Shapes
```jsonc
// user  (never includes passwordHash)
{ "id": "65...", "email": "op@signal.io", "callsign": "GHOST", "createdAt": "ISO" }
// token: signed JWT, payload { id, email }, expires 7d
```

---

## Health
### `GET /api/health` → `200 { ok:true, service:"signal-api", ts }`

---

## Data models (Mongo, db: `signal`)
- **User**: email (unique), passwordHash, callsign, timestamps
- **Watchpoint**: userId, name, lat, lon, radiusKm, sources[] — `quake|aircraft|iss|spaceweather|weather`
- **Note**: userId, body, watchpointId?, pinned
- **AlertRule**: userId, name, source, field(=magnitude), op(gte|lte|gt|lt|eq), value, watchpointId?, active

---

## Feeds  (Sprint 2 — public, no auth)

### `GET /api/feeds` → `{ events: SignalEvent[], generatedAt }`
Merged cache of all polled sources (quake, aircraft, iss, spaceweather).

### `GET /api/feeds/:source` → `{ events, generatedAt }`
One source. `:source` ∈ `quake | aircraft | iss | spaceweather`.

### `GET /api/feeds/weather?lat=&lon=` → `{ events, generatedAt }`
On-demand weather for a point (Open-Meteo). `400` if lat/lon missing.

Refresh cadence: quake 60s · aircraft 30s · iss 5s · spaceweather 300s. A dead
upstream falls back to a cached/fixture value — the feed never 500s.

---

## CRUD  (Sprint 2 — all protected + user-scoped)
`/api/watchpoints` · `/api/notes` · `/api/alertrules` — identical verbs:
- `GET /` → `{ items: [...] }` (only the caller's own)
- `POST /` → `201 { item }` · `400` on validation error
- `PATCH /:id` → `{ item }` · `404` if not found **or not owned**
- `DELETE /:id` → `{ ok:true, id }` · `404` if not found **or not owned**
- any route without a valid token → `401`

Create field sets / required:
- **watchpoint**: `name`*, `lat`*, `lon`*, `radiusKm`, `sources[]`
- **note**: `body`*, `watchpointId`, `pinned`
- **alertrule**: `name`*, `source`*, `value`*, `field`(=magnitude), `op`(gte|lte|gt|lt|eq), `watchpointId`, `active`

---

## Socket.io  (Sprint 3 — real-time)
Connect with the JWT in the handshake: `io(API_URL, { auth: { token } })`.
Bad/missing token → `connect_error`. On connect the server seeds the client with
the current cache via `feed:update` (one per source), so the same handler covers
initial state and deltas.

| Event (server → client) | Payload | When |
|---|---|---|
| `feed:update` | `{ source, events: SignalEvent[] }` | each source refresh + on connect |
| `alert:hit` | `{ rule, event: SignalEvent }` | a refreshed event matches one of the user's active AlertRules (deduped per rule+event) |

Alerts are evaluated only for currently-connected users and delivered to a
private `user:<id>` room.

### Normalized `SignalEvent` (the feed contract — frozen so the frontend can build against it)
```jsonc
{
  "id": "quake:us7000...",          // stable per source+native id
  "source": "quake",                 // quake|aircraft|iss|spaceweather|weather
  "title": "M4.6 — 12km NE of ...",
  "lat": 38.1, "lon": -122.3,        // decimal degrees — NOT latitude/lng
  "magnitude": 4.6,                  // severity scalar (mag, Kp, altitude…) or null
  "ts": 1781954267376,               // epoch ms
  "meta": {}                          // source-specific extras
}
```
