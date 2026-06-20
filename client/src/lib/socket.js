import { io } from "socket.io-client";
import { getToken } from "./api.js";
import { useFeedStore } from "../store/feedStore.js";

let socket = null;

// Connect with the JWT in the handshake. In dev, URL is undefined → same-origin,
// and Vite's /socket.io proxy (ws:true) forwards to the server. In prod,
// VITE_API_URL points at the deployed API.
export function connectSocket() {
  if (socket) return socket;
  const URL = import.meta.env.VITE_API_URL || undefined;
  socket = io(URL, { auth: { token: getToken() }, reconnection: true });

  const store = useFeedStore.getState();
  socket.on("connect", () => store.setConnected(true));
  socket.on("disconnect", () => store.setConnected(false));
  socket.on("connect_error", () => store.setConnected(false));
  socket.on("feed:update", ({ source, events }) => store.mergeSource(source, events));
  socket.on("alert:hit", ({ rule, event }) => store.pushAlert(rule, event));
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}
