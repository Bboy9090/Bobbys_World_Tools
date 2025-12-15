import http from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { addClient, broadcast } from "./hub";
import fs from "node:fs";
import path from "node:path";

export function attachWs(httpServer: http.Server) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    addClient(ws);
    ws.send(JSON.stringify({ kind: "hello", ok: true }));
  });

  // Optional: stream BootForge log tail every 2s
  const repoRoot = path.resolve(process.cwd(), "../../..");
  const logFile = path.join(repoRoot, "logs", "bootforge.log");

  setInterval(() => {
    try {
      const data = fs.existsSync(logFile) ? fs.readFileSync(logFile, "utf-8") : "";
      const tail = data.slice(-12000);
      broadcast({ kind: "bootforge_log_tail", tail });
    } catch {}
  }, 2000);
}
