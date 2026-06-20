import { safeFetch } from "./safeFetch.js";
import fixture from "./__fixtures__/iss.js";

const URL = "https://api.wheretheiss.at/v1/satellites/25544";

// Single moving point.
function map(raw) {
  return [
    {
      id: "iss:25544",
      source: "iss",
      title: "ISS (ZARYA)",
      lat: raw.latitude,
      lon: raw.longitude,
      magnitude: raw.altitude, // km altitude as the scalar
      ts: (raw.timestamp || Math.floor(Date.now() / 1000)) * 1000,
      meta: { velocity: raw.velocity },
    },
  ];
}

export const issFixture = map(fixture);

export async function fetchISS() {
  return map(await safeFetch(URL, { timeout: 10000 })); // wheretheiss.at can be slow
}
