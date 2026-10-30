import { io, Socket } from "socket.io-client";

// Socket.IO listens on the same HTTP server as the REST API but at the
// root path, not under /api — so the socket origin is the API origin with
// any trailing "/api" stripped.
const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api").replace(/\/api\/?$/, "");

let socket: Socket | null = null;

// One shared socket, authenticated via the same httpOnly session cookie as
// the REST API (withCredentials sends it along on the handshake) — no token
// to pass in from the caller. A caller that knows the user is logged out
// should call disconnectSocket() instead of asking for a new one.
export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, { withCredentials: true, transports: ["websocket", "polling"] });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}
