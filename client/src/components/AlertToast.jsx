import { useEffect } from "react";
import { useFeedStore } from "../store/feedStore.js";

// Transient pop-ups for incoming alert:hit. Auto-dismiss after 8s; click to
// dismiss sooner. The persistent record lives in the Recent Alerts panel.
export default function AlertToast() {
  const toasts = useFeedStore((s) => s.toasts);
  const dismiss = useFeedStore((s) => s.dismissToast);

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) => setTimeout(() => dismiss(t.id), 8000));
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismiss]);

  if (!toasts.length) return null;
  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div key={t.id} className="toast" onClick={() => dismiss(t.id)}>
          <div className="toast-head">⚠ ALERT · {t.ruleName}</div>
          <div className="toast-body">
            {t.source.toUpperCase()} · {t.title}
          </div>
          <div className="toast-dismiss">click to dismiss</div>
        </div>
      ))}
    </div>
  );
}
