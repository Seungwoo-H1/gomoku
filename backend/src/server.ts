// HTTP + Socket.IO server entry

import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { setupSocketHandlers } from './sockets/socket.handler';

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
});

setupSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`🎯 Gomoku backend running on http://localhost:${PORT}`);
  console.log(`📡 Socket.IO ready`);
});

export { io, server };
