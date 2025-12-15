import type WebSocket from "ws";

const clients = new Set<WebSocket>();

export function addClient(ws: WebSocket) {
  clients.add(ws);
  ws.on("close", () => clients.delete(ws));
}

export function broadcast(payload: any) {
  const msg = JSON.stringify(payload);
  for (const c of clients) {
    if (c.readyState === 1) c.send(msg);
  }
}
