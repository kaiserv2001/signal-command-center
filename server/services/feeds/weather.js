import { safeFetch } from "./safeFetch.js";

// Weather is per-point (no global feed), so it's fetched on demand for a given
// lat/lon — e.g. a watchpoint — rather than polled into the aggregator cache.
export async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
  try {
    const raw = await safeFetch(url);
    const cw = raw.current_weather;
    if (!cw) return [];
    return [
      {
        id: `weather:${lat.toFixed(2)},${lon.toFixed(2)}`,
        source: "weather",
        title: `${cw.temperature}°C · wind ${cw.windspeed}`,
        lat,
        lon,
        magnitude: cw.temperature,
        ts: Date.now(),
        meta: { windspeed: cw.windspeed, weathercode: cw.weathercode },
      },
    ];
  } catch (e) {
    console.warn(`⚠ weather failed: ${e.message}`);
    return [];
  }
}
