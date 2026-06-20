// Minimal USGS-shaped sample used when the live feed is unreachable in dev.
export default {
  features: [
    {
      id: "demo_quake_1",
      properties: { title: "M2.5 — demo quake (fixture)", mag: 2.5, time: 1781950000000, url: "" },
      geometry: { coordinates: [-122.5, 38.0, 5.0] },
    },
    {
      id: "demo_quake_2",
      properties: { title: "M4.8 — demo quake (fixture)", mag: 4.8, time: 1781951000000, url: "" },
      geometry: { coordinates: [140.1, 35.6, 30.0] },
    },
  ],
};
