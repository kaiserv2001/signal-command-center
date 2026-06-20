import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

// Free CARTO dark tiles — no token, no cost.
const DARK = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

const COLORS = {
  quake: "#ffb000",
  aircraft: "#22d3ee",
  iss: "#39ff14",
  spaceweather: "#ff3b3b",
  weather: "#5c6b78",
};

function radiusFor(e) {
  const m = Math.abs(Number(e.magnitude) || 0);
  return Math.max(3, Math.min(14, 3 + m));
}

// Renders one marker per event, colored by source and sized by magnitude.
// Events with null coords (e.g. global space weather) are skipped — they live
// in the status bar instead.
export default function MapView({ events = [] }) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={2}
      worldCopyJump
      zoomControl={false}
      style={{ height: "100vh", width: "100vw", background: "var(--bg)" }}
    >
      <TileLayer url={DARK} attribution="&copy; OpenStreetMap &copy; CARTO" />
      {events
        .filter((e) => e.lat != null && e.lon != null)
        .map((e) => (
          <CircleMarker
            key={e.id}
            center={[e.lat, e.lon]}
            radius={radiusFor(e)}
            pathOptions={{
              color: COLORS[e.source] || "#c7d2da",
              weight: 1,
              fillOpacity: 0.5,
            }}
          >
            <Popup>
              <strong>{e.source.toUpperCase()}</strong>
              <br />
              {e.title}
            </Popup>
          </CircleMarker>
        ))}
    </MapContainer>
  );
}
