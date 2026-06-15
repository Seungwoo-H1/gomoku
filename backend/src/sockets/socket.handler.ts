// Socket.IO handler — real-time game logic

import { Server, Socket } from 'socket.io';
import { PrismaClient, GameStatus } from '@prisma/client';
import { validateMove, createGameStats } from '../engine/game';
import { createBoard, cloneBoard, placeStone } from '../engine/board';
import type { Stone } from '../engine/types';
import { saveGame, createInitialGame, getGame } from '../services/game.service';
import { sendChat, getChatHistory } from '../services/chat.service';
import { getUserById } from '../services/auth.service';
import { BoardState, SocketUser, GameSnapshot, PlayerRole } from './socket.types';

const prisma = new PrismaClient();

// In-memory store: userId -> SocketUser
const users = new Map<string, SocketUser>();
// roomId -> Set of socketIds
const roomSockets = new Map<string, Set<string>>();

// BoardState serialization helpers
function boardToSerializable(board: number[][]): BoardState {
  return { rows: board.length, cols: board[0]?.length || 0, stones: board };
}

function serializableToBoard(state: BoardState): number[][] {
  return state.stones;
}

function boardToJSON(board: number[][]): string {
  return JSON.stringify(board);
}

function generateBoardState(board: number[][]): BoardState {
  return boardToSerializable(board);
}

/**
 * Get all users in a room (socket data).
 */
function getRoomUsers(roomId: string): { userId: string; nickname: string; role: string }[] {
  const members: { userId: string; nickname: string; role: string }[] = [];
  const socketIds = roomSockets.get(roomId);
  if (!socketIds) return members;

  for (const socketId of socketIds) {
    const user = users.get(socketId);
    if (user) {
      const membership = user.memberships.find(m => m.roomId === roomId);
      if (membership) {
        members.push({
          userId: user.userId,
          nickname: user.nickname,
          role: membership.role,
        });
      }
    }
  }
  return members;
}

/**
 * Serialize current room state for a player.
 */
async function serializeRoomState(
  roomId: string,
  socketId: string
): Promise<{
  room: { id: string; roomName: string; status: string; maxPlayers: number };
  players: { userId: string; nickname: string; role: string }[];
  spectators: { userId: string; nickname: string }[];
  game: GameSnapshot | null;
  recentChats: { userId: string; nickname: string; message: string; createdAt: string }[];
} | null> {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      roomUsers: { include: { user: { select: { id: true, nickname: true } } } },
    },
  });

  if (!room) return null;

  const players = room.roomUsers
    .filter(u => u.role === 'PLAYER_BLACK' || u.role === 'PLAYER_WHITE')
    .map(u => ({ userId: u.user.id, nickname: u.user.nickname, role: u.role }));

  const spectators = room.roomUsers
    .filter(u => u.role === 'SPECTATOR')
    .map(u => ({ userId: u.user.id, nickname: u.user.nickname }));

  const game = await getGame(roomId);
  const boardData = game && game.boardState === 'initial'
    ? generateBoardState(createBoard())
    : game ? (JSON.parse(game.boardState) as BoardState) : null;
  const gameSnapshot: GameSnapshot | null = game && boardData
    ? {
        boardState: boardData,
        turn: game.turn,
        winner: game.winnerId,
        status: game.status,
      }
    : null;

  const recentChats = (await getChatHistory(roomId, 50)).map(c => ({
    userId: c.userId,
    nickname: c.user.nickname,
    message: c.message,
    createdAt: c.createdAt.toISOString(),
  }));

  return {
    room: {
      id: room.id,
      roomName: room.roomName,
      status: room.status,
      maxPlayers: room.maxPlayers,
    },
    players,
    spectators,
    game: gameSnapshot,
    recentChats,
  };
}

export function setupSocketHandlers(io: Server): void {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      next(new Error('Unauthorized: No token provided'));
      return;
    }
    try {
      // Verify via JWT middleware
      const jwt = (await import('jsonwebtoken')).default;
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error('JWT_SECRET not set');
      const payload = jwt.verify(token as string, secret) as { userId: string; nickname: string };
      socket.data.user = payload;
      next();
    } catch {
      next(new Error('Unauthorized: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as { userId: string; nickname: string };
    console.log(`[Socket] Connected: ${user.nickname} (${user.userId})`);

    // Register user
    const socketUser: SocketUser = {
      socketId: socket.id,
      userId: user.userId,
      nickname: user.nickname,
      memberships: [],
    };
    users.set(socket.id, socketUser);

    // ---- join-room ----
    socket.on('join-room', async (data: { roomId: string }, ack) => {
      try {
        // Check if already in room
        const existing = socketUser.memberships.find(m => m.roomId === data.roomId);
        if (existing) {
          ack({ error: 'ALREADY_IN_ROOM', message: 'Already in this room' });
          return;
        }

        const room = await prisma.room.findUnique({
          where: { id: data.roomId },
          include: { roomUsers: { select: { userId: true, role: true } } },
        });

        if (!room) {
          ack({ error: 'ROOM_NOT_FOUND', message: 'Room not found' });
          return;
        }

        const playerCount = room.roomUsers.filter(
          u => u.role === 'PLAYER_BLACK' || u.role === 'PLAYER_WHITE'
        ).length;

        if (playerCount >= room.maxPlayers && room.status === 'LOBBY') {
          // Allow as spectator
        }

        // Determine role
        let role: PlayerRole;
        if (room.status === 'PLAYING') {
          role = 'SPECTATOR';
        } else {
          const hasBlack = room.roomUsers.some(u => u.role === 'PLAYER_BLACK');
          role = hasBlack ? 'PLAYER_WHITE' : 'PLAYER_BLACK';
        }

        // Add to DB
        await prisma.roomUser.create({
          data: {
            roomId: data.roomId,
            userId: user.userId,
            role,
          },
        });

        // Track in memory
        socketUser.memberships.push({ roomId: data.roomId, role });
        if (!roomSockets.has(data.roomId)) {
          roomSockets.set(data.roomId, new Set());
        }
        roomSockets.get(data.roomId)!.add(socket.id);

        // Send room state to the joining player
        const state = await serializeRoomState(data.roomId, socket.id);
        if (state) {
          socket.emit('room-joined', state);
        }

        // Notify others
        socket.to(data.roomId).emit('player-joined', {
          userId: user.userId,
          nickname: user.nickname,
          role,
          isPlayer: role !== 'SPECTATOR',
        });

        ack({ success: true });
      } catch (err: any) {
        console.error('[Socket] join-room error:', err);
        ack({ error: 'UNKNOWN_ERROR', message: err.message });
      }
    });

    // ---- leave-room ----
    socket.on('leave-room', async (data: { roomId: string }, ack) => {
      try {
        socketUser.memberships = socketUser.memberships.filter(m => m.roomId !== data.roomId);
        const socketSet = roomSockets.get(data.roomId);
        if (socketSet) {
          socketSet.delete(socket.id);
          if (socketSet.size === 0) roomSockets.delete(data.roomId);
        }
        socket.leave(data.roomId);

        // Update DB — remove RoomUser
        await prisma.roomUser.deleteMany({
          where: { roomId: data.roomId, userId: user.userId },
        });

        // Notify others
        io.to(data.roomId).emit('player-left', {
          userId: user.userId,
          nickname: user.nickname,
          role: socketUser.memberships.length > 0
            ? socketUser.memberships[0].role
            : 'SPECTATOR' as PlayerRole,
        });

        ack({ success: true });
      } catch (err: any) {
        ack({ error: 'UNKNOWN_ERROR', message: err.message });
      }
    });

    // ---- game-move ----
    socket.on('game-move', async (data: { roomId: string; row: number; col: number }, ack) => {
      try {
        const roomId = data.roomId;
        const { row, col } = data;

        // Find player's role in this room
        const membership = socketUser.memberships.find(m => m.roomId === roomId);
        if (!membership) {
          ack({ error: 'NOT_IN_ROOM', message: 'Not in this room' });
          return;
        }
        if (membership.role === 'SPECTATOR') {
          ack({ error: 'FORBIDDEN', message: 'Spectators cannot play' });
          return;
        }

        // Get game state from DB
        const game = await prisma.game.findUnique({ where: { roomId } });
        if (!game) {
          ack({ error: 'NO_GAME', message: 'No active game' });
          return;
        }
        if (game.status === 'FINISHED') {
          ack({ error: 'GAME_FINISHED', message: 'Game already finished' });
          return;
        }

        // Parse board
        const rawBoard: Stone[][] = game.boardState === 'initial'
          ? createBoard()
          : (JSON.parse(game.boardState) as Stone[][]);

        // Determine stone based on turn (0=black→1, 1=white→2)
        const stone = game.turn === 0 ? 1 : 2;

        // Validate and execute move
        const moveResult = validateMove(
          { board: rawBoard, turn: game.turn as Stone, lastMove: null, winner: null, isFinished: false },
          row,
          col,
          stone as Stone
        );

        if (!moveResult.success) {
          ack({ error: moveResult.error || 'INVALID_MOVE', message: moveResult.error });
          return;
        }

        // Determine next turn
        const nextTurn = moveResult.winner ? game.turn : (game.turn === 0 ? 1 : 0);

        // Save to DB
        const winnerId = moveResult.winner ? user.userId : undefined;
        const status = moveResult.winner ? 'FINISHED' : 'ACTIVE';

        await saveGame({
          roomId,
          boardState: boardToJSON(moveResult.board as Stone[][]),
          turn: nextTurn,
          winnerId,
          status: status as GameStatus,
        });

        // Update room status
        if (moveResult.winner) {
          await prisma.room.update({
            where: { id: roomId },
            data: { status: 'FINISHED' },
          });
        }

        // Emit to all in room
        const emitData = {
          row,
          col,
          stone,
          turn: nextTurn,
          winner: moveResult.winner ? (moveResult.winner === 1 ? 'BLACK' : 'WHITE') : null,
          winnerId: moveResult.winner ? user.userId : null,
        };

        io.to(roomId).emit('move-accepted', emitData);

        if (moveResult.winner) {
          io.to(roomId).emit('game-ended', {
            winnerId: user.userId,
            winnerNickname: user.nickname,
            reason: 'five-in-a-row',
          });
        }

        ack({ success: true });
      } catch (err: any) {
        console.error('[Socket] game-move error:', err);
        ack({ error: 'UNKNOWN_ERROR', message: err.message });
      }
    });

    // ---- game-restart ----
    socket.on('game-restart', async (data: { roomId: string }, ack) => {
      try {
        const roomId = data.roomId;

        // Check if owner
        const membership = socketUser.memberships.find(m => m.roomId === roomId);
        if (!membership || membership.role !== 'OWNER') {
          ack({ error: 'NOT_OWNER', message: 'Only room owner can restart' });
          return;
        }

        const newBoard = createBoard();

        await saveGame({
          roomId,
          boardState: boardToJSON(newBoard),
          turn: 0,
          winnerId: undefined,
          status: 'ACTIVE',
        });

        await prisma.room.update({
          where: { id: roomId },
          data: { status: 'PLAYING' },
        });

        const boardState = generateBoardState(newBoard);
        io.to(roomId).emit('game-restarted', { boardState, turn: 0 });

        ack({ success: true });
      } catch (err: any) {
        ack({ error: 'UNKNOWN_ERROR', message: err.message });
      }
    });

    // ---- chat-send ----
    socket.on('chat-send', async (data: { roomId: string; message: string }, ack) => {
      try {
        const { roomId, message } = data;
        if (!message || message.trim().length === 0) return;

        const chat = await sendChat(roomId, user.userId, message.trim());

        const chatData = {
          userId: chat.userId,
          nickname: chat.user.nickname,
          message: chat.message,
          createdAt: chat.createdAt.toISOString(),
        };

        io.to(roomId).emit('chat-receive', chatData);
        // Echo to sender
        socket.emit('chat-receive', chatData);

        ack({ success: true });
      } catch (err: any) {
        ack({ error: 'UNKNOWN_ERROR', message: err.message });
      }
    });

    // ---- disconnect ----
    socket.on('disconnect', async () => {
      console.log(`[Socket] Disconnected: ${user.nickname}`);

      // Leave all rooms
      for (const membership of socketUser.memberships) {
        const socketSet = roomSockets.get(membership.roomId);
        if (socketSet) {
          socketSet.delete(socket.id);
          if (socketSet.size === 0) roomSockets.delete(membership.roomId);
        }
        socket.leave(membership.roomId);

        io.to(membership.roomId).emit('player-left', {
          userId: user.userId,
          nickname: user.nickname,
          role: membership.role,
        });

        // Clean up DB
        await prisma.roomUser.deleteMany({
          where: { roomId: membership.roomId, userId: user.userId },
        });
      }

      users.delete(socket.id);
    });
  });
}
