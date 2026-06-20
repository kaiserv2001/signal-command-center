import { fetchQuakes, quakeFixture } from "./quakes.js";
import { fetchAircraft, aircraftFixture } from "./aircraft.js";
import { fetchISS, issFixture } from "./iss.js";
import { fetchSpaceWeather, spaceweatherFixture } from "./spaceweather.js";

// Polled global sources. Weather is per-point (on demand), so not listed here.
// `fixture` seeds the cache only on cold start if the live fetch fails.
const SOURCES = {
  quake: { fn: fetchQuakes, intervalMs: 60_000, fixture: quakeFixture },
  aircraft: { fn: fetchAircraft, intervalMs: 30_000, fixture: aircraftFixture },
  iss: { fn: fetchISS, intervalMs: 5_000, fixture: issFixture },
  spaceweather: { fn: fetchSpaceWeather, intervalMs: 300_000, fixture: spaceweatherFixture },
};

// Single in-memory cache of normalized events, keyed by source. Refreshes each
// source on its own cadence; a failed refresh keeps the last good cache.
class Aggregator {
  constructor() {
    this.cache = new Map();
    this.timers = [];
    this.onUpdate = null; // set by the socket layer in Sprint 3
  }

  getAll() {
    return [...this.cache.values()].flat();
  }

  getBySource(source) {
    return this.cache.get(source) || [];
  }

  async refresh(source) {
    const def = SOURCES[source];
    if (!def) return;
    try {
      const events = await def.fn();
      this.cache.set(source, events); // live data wins (even if legitimately empty)
      if (this.onUpdate) this.onUpdate(source, events);
    } catch (e) {
      console.warn(`⚠ feed ${source} refresh failed: ${e.message}`);
      // Cold start only: seed the fixture so the UI isn't blank. On a warm cache
      // keep the last good live data rather than downgrading to demo events.
      if (!this.cache.has(source)) {
        this.cache.set(source, def.fixture || []);
        if (this.onUpdate) this.onUpdate(source, this.cache.get(source));
      }
    }
  }

  async start() {
    await Promise.all(Object.keys(SOURCES).map((s) => this.refresh(s)));
    for (const [s, def] of Object.entries(SOURCES)) {
      this.timers.push(setInterval(() => this.refresh(s), def.intervalMs));
    }
    console.log(`▣ feed aggregator started (${this.getAll().length} events cached)`);
  }

  stop() {
    this.timers.forEach(clearInterval);
    this.timers = [];
  }
}

export const aggregator = new Aggregator();
export { SOURCES };
