/* Scan Bench Meet: a tiny relay. Each meeting code is one Durable Object (a "room"). Everyone in the room keeps a WebSocket
   open; whatever one person sends is passed straight to the others. Nothing is stored. Idle rooms sleep (hibernation), and
   the keep-alive "ping" is answered without waking the room, so quiet meetings cost nothing. */
const MAX_MSG = 1000000;          // one message (a "Look here" picture is the biggest thing sent)
const MAX_PEOPLE = 50;            // per meeting

export class Room {
  constructor(state, env) {
    this.state = state;
    try { this.state.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong')); } catch (e) {}
  }
  async fetch(req) {
    if ((req.headers.get('Upgrade') || '').toLowerCase() !== 'websocket') return new Response('Expected a WebSocket', { status: 426 });
    if (this.state.getWebSockets().length >= MAX_PEOPLE) return new Response('This meeting is full', { status: 429 });
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.state.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }
  async webSocketMessage(ws, msg) {
    if (typeof msg !== 'string' || msg.length > MAX_MSG) return;
    for (const other of this.state.getWebSockets()) {
      if (other === ws) continue;
      try { other.send(msg); } catch (e) {}
    }
  }
  async webSocketClose(ws, code, reason) { try { ws.close(code === 1005 ? 1000 : code, reason); } catch (e) {} }
  async webSocketError(ws) { try { ws.close(1011, 'error'); } catch (e) {} }
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response('Scan Bench Meet server is running.', { headers: { 'content-type': 'text/plain', 'access-control-allow-origin': '*' } });
    }
    const m = url.pathname.match(/^\/room\/([A-Z0-9]{6})$/);
    if (!m) return new Response('Not found', { status: 404 });
    return env.ROOMS.get(env.ROOMS.idFromName(m[1])).fetch(req);
  }
};
