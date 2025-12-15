/**
 * WebSocket hook for live updates
 */

import { useEffect, useState } from "react";

export function useWs() {
  const [bootforgeTail, setBootforgeTail] = useState<string>("");

  useEffect(() => {
    const proto = location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${location.host}/ws`);

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.kind === "bootforge_log_tail") setBootforgeTail(msg.tail ?? "");
      } catch {}
    };

    return () => ws.close();
  }, []);

  return { bootforgeTail };
}
