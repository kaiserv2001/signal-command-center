import { useEffect, useRef, useState } from "react";

// Draggable HUD panel — grab the header to move it. Mirrors the owner's
// portfolio draggable info-cards. No drag library needed.
export default function Panel({ title, children, init = { x: 16, y: 16 } }) {
  const [pos, setPos] = useState(init);
  const drag = useRef(null);

  function onDown(e) {
    drag.current = { sx: e.clientX, sy: e.clientY, x: pos.x, y: pos.y };
  }

  useEffect(() => {
    function move(e) {
      if (!drag.current) return;
      setPos({
        x: drag.current.x + e.clientX - drag.current.sx,
        y: drag.current.y + e.clientY - drag.current.sy,
      });
    }
    function up() {
      drag.current = null;
    }
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  return (
    <div className="panel" style={{ left: pos.x, top: pos.y }}>
      <header className="panel-head" onMouseDown={onDown}>
        {title.toUpperCase()}
      </header>
      <div className="panel-body">{children}</div>
    </div>
  );
}
