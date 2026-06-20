import { safeFetch } from "./safeFetch.js";
import fixture from "./__fixtures__/quakes.js";

const URL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";

// USGS GeoJSON -> normalized SignalEvent[] (coords are [lon, lat, depth]).
function map(raw) {
  return (raw.features || []).map((f) => ({
    id: `quake:${f.id}`,
    source: "quake",
    title: f.properties.title,
    lat: f.geometry.coordinates[1],
    lon: f.geometry.coordinates[0],
    magnitude: f.properties.mag,
    ts: f.properties.time,
    meta: { depthKm: f.geometry.coordinates[2], url: f.properties.url },
  }));
}

// Pre-mapped fixture — the aggregator uses it only on cold start (empty cache).
export const quakeFixture = map(fixture);

// Throws on failure so the aggregator can keep the last good cache instead of
// downgrading live data to the fixture.
export async function fetchQuakes() {
  return map(await safeFetch(URL));
}
