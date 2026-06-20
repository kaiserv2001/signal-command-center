import { safeFetch } from "./safeFetch.js";
import fixture from "./__fixtures__/spaceweather.js";

const URL =
  "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json";

// NOAA product is an array of objects { time_tag, Kp, a_running, station_count }.
// Latest entry -> current planetary Kp index. This is a GLOBAL metric with no
// real coordinates, so lat/lon are null and the frontend shows it in the status
// bar rather than as a map marker.
function map(raw) {
  const rows = Array.isArray(raw)
    ? raw.filter((r) => r && r.Kp != null && !Number.isNaN(Number(r.Kp)))
    : [];
  const last = rows[rows.length - 1];
  if (!last) return [];
  const kp = Number(last.Kp);
  return [
    {
      id: "spaceweather:kp",
      source: "spaceweather",
      title: `Planetary Kp index ${kp}`,
      lat: null,
      lon: null,
      magnitude: kp,
      ts: Date.parse(last.time_tag) || Date.now(),
      meta: { scale: "Kp 0–9", status: kp >= 5 ? "geomagnetic storm" : "quiet" },
    },
  ];
}

export const spaceweatherFixture = map(fixture);

export async function fetchSpaceWeather() {
  return map(await safeFetch(URL, { timeout: 8000 }));
}
