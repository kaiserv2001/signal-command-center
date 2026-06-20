import { Router } from "express";
import { aggregator } from "../services/feeds/aggregator.js";
import { fetchWeather } from "../services/feeds/weather.js";

// Feeds are public data — no auth required.
const router = Router();

// GET /api/feeds -> merged events from all polled sources
router.get("/", (_req, res) => {
  res.json({ events: aggregator.getAll(), generatedAt: Date.now() });
});

// GET /api/feeds/weather?lat=&lon= -> on-demand weather for a point.
// Declared before /:source so the literal "weather" path wins.
router.get("/weather", async (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  if (Number.isNaN(lat) || Number.isNaN(lon))
    return res.status(400).json({ error: "lat and lon query params required" });
  const events = await fetchWeather(lat, lon);
  res.json({ events, generatedAt: Date.now() });
});

// GET /api/feeds/:source -> one source's cached events
router.get("/:source", (req, res) => {
  res.json({ events: aggregator.getBySource(req.params.source), generatedAt: Date.now() });
});

export default router;
