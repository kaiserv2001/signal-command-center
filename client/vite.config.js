import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev proxy: forward API + websocket traffic to the Express server so the
// browser talks to one origin and there's no CORS friction locally.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4000",
      "/socket.io": { target: "http://localhost:4000", ws: true },
    },
  },
});
