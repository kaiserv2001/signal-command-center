import { safeFetch } from "./safeFetch.js";
import fixture from "./__fixtures__/aircraft.js";

const URL = "https://opensky-network.org/api/states/all";

// OpenSky returns rows of arrays. Index map:
// [0]=icao24 [1]=callsign [2]=origin [4]=time_pos [5]=lon [6]=lat [7]=alt [9]=velocity
function map(raw) {
  return (raw.states || [])
    .filter((s) => s[5] != null && s[6] != null)
    .slice(0, 400) // cap payload size for the map
    .map((s) => ({
      id: `aircraft:${s[0]}`,
      source: "aircraft",
      title: (s[1] || "").trim() || s[0],
      lat: s[6],
      lon: s[5],
      magnitude: s[7] ?? null, // altitude as the scalar
      ts: (s[4] || Math.floor(Date.now() / 1000)) * 1000,
      meta: { velocity: s[9], origin: s[2] },
    }));
}

// Cold-start fixture only (OpenSky rate-limits/aborts often). On a warm cache
// the aggregator keeps the last good live data rather than dropping to this.
export const aircraftFixture = map(fixture);

export async function fetchAircraft() {
  return map(await safeFetch(URL, { timeout: 13000 })); // OpenSky anon is slow
}
