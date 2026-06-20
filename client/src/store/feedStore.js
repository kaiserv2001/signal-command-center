import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Central live store.
// - eventsById / toasts / connected: live, in-memory only.
// - alertLog: PERSISTED to localStorage so the alert history survives a refresh
//   (toasts are transient flashes; the log is the record).
export const useFeedStore = create(
  persist(
    (set) => ({
      eventsById: {},
      toasts: [],        // transient pop-ups (auto-dismiss)
      alertLog: [],      // persisted history (last 20)
      kp: null,
      connected: false,
      wasConnected: false, // true once we've connected at least once

      seed: (events) =>
        set((s) => {
          const map = { ...s.eventsById };
          for (const e of events) map[e.id] = e;
          const sw = events.find((e) => e.source === "spaceweather");
          return { eventsById: map, kp: sw ? sw.magnitude : s.kp };
        }),

      // Replace a source's events wholesale so stale ones drop out.
      mergeSource: (source, events) =>
        set((s) => {
          const map = {};
          for (const id in s.eventsById) {
            if (s.eventsById[id].source !== source) map[id] = s.eventsById[id];
          }
          for (const e of events) map[e.id] = e;
          const kp = source === "spaceweather" && events[0] ? events[0].magnitude : s.kp;
          return { eventsById: map, kp };
        }),

      pushAlert: (rule, event) =>
        set((s) => {
          const entry = {
            id: `${rule._id || rule.id}:${event.id}:${Date.now()}`,
            ruleName: rule.name,
            source: event.source,
            title: event.title,
            ts: Date.now(),
          };
          return {
            toasts: [entry, ...s.toasts].slice(0, 5),
            alertLog: [entry, ...s.alertLog].slice(0, 20),
          };
        }),
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      clearAlertLog: () => set({ alertLog: [] }),
      setConnected: (v) => set((s) => ({ connected: v, wasConnected: s.wasConnected || v })),
    }),
    {
      name: "signal-store",
      storage: createJSONStorage(() => localStorage),
      // Only the alert history persists; live feed/connection state does not.
      partialize: (s) => ({ alertLog: s.alertLog }),
    }
  )
);

export const selectEvents = (s) => Object.values(s.eventsById);
