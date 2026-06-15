// Socket.IO client configuration

import { io, Socket } from 'socket.io-client';
import { getToken } from './api';

const GAME_SERVER_URL = import.meta.env.VITE_GAME_SERVER_URL || 'http://localhost:8080';
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(GAME_SERVER_URL, {
      auth: { token: getToken() || '' },
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function reconnectSocket(): void {
  if (socket) {
    socket.disconnect();
  }
  socket = io(GAME_SERVER_URL, {
    auth: { token: getToken() || '' },
    transports: ['websocket', 'polling'],
  });
}

export { API_BASE_URL };
