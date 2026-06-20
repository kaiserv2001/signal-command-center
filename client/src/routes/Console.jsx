import { useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";
import { useFeedStore, selectEvents } from "../store/feedStore.js";
import { connectSocket, disconnectSocket } from "../lib/socket.js";
import MapView from "../components/MapView.jsx";
import Panel from "../components/Panel.jsx";
import StatusBar from "../components/StatusBar.jsx";
import IncidentTicker from "../components/IncidentTicker.jsx";
import AlertToast from "../components/AlertToast.jsx";
import AlertLogPanel from "../components/AlertLogPanel.jsx";
import WatchpointsPanel from "../components/WatchpointsPanel.jsx";
import AlertRulesPanel from "../components/AlertRulesPanel.jsx";
import NotesPanel from "../components/NotesPanel.jsx";

// Live HUD. Seed from REST, then stream deltas over the socket — both flow into
// one feed store the components read.
export default function Console() {
  const { user, logout } = useAuth();
  const events = useFeedStore(selectEvents);
  const kp = useFeedStore((s) => s.kp);
  const connected = useFeedStore((s) => s.connected);
  const wasConnected = useFeedStore((s) => s.wasConnected);
  const offline = wasConnected && !connected; // a real drop, not the initial connect

  useEffect(() => {
    let active = true;
    api
      .feeds()
      .then((d) => { if (active) useFeedStore.getState().seed(d.events || []); })
      .catch(() => {});
    connectSocket();
    return () => {
      active = false;
      disconnectSocket();
    };
  }, []);

  return (
    <div className="console">
      <MapView events={events} />
      <StatusBar user={user} events={events} kp={kp} connected={connected} onLogout={logout} />
      {offline && <div className="offline-banner">⚠ UPLINK LOST · RECONNECTING…</div>}
      <AlertToast />

      <Panel title="Incident Feed" init={{ x: 16, y: 46 }}>
        <IncidentTicker events={events} offline={offline} />
      </Panel>
      <Panel title="Watchpoints" init={{ x: 16, y: 360 }}>
        <WatchpointsPanel />
      </Panel>
      <Panel title="Alert Rules" init={{ x: 312, y: 46 }}>
        <AlertRulesPanel />
      </Panel>
      <Panel title="Mission Log" init={{ x: 312, y: 320 }}>
        <NotesPanel />
      </Panel>
      <Panel title="Recent Alerts" init={{ x: 608, y: 46 }}>
        <AlertLogPanel />
      </Panel>
    </div>
  );
}
