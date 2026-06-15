// Socket.IO client configuration

import { io, Socket } from 'socket.io-client';
import { getToken } from './api';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || window.location.origin, {
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
  socket = io(import.meta.env.VITE_API_URL || window.location.origin, {
    auth: { token: getToken() || '' },
    transports: ['websocket', 'polling'],
  });
}
