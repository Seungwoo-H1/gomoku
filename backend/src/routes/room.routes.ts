// Room routes

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { createRoom, getRoomList, getRoomWithDetails, joinRoom, leaveRoom } from '../services/room.service';

const router = Router();

// Create room
router.post('/rooms', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).user.userId;
    const nickname = (req as any).user.nickname;
    const { roomName, maxPlayers } = req.body;

    if (!roomName || typeof roomName !== 'string') {
      return res.status(400).json({ error: 'Room name required' });
    }

    const room = await createRoom(userId, roomName.trim(), maxPlayers || 2);

    res.status(201).json({
      id: room.id,
      roomName: room.roomName,
      status: room.status,
      maxPlayers: room.maxPlayers,
      ownerId: room.ownerId,
      createdAt: room.createdAt,
    });
  } catch (err: any) {
    next(err);
  }
});

// List rooms
router.get('/rooms', async (_req, res, next) => {
  try {
    const rooms = await getRoomList();
    const result = rooms.map(r => ({
      id: r.id,
      roomName: r.roomName,
      status: r.status,
      playerCount: r.roomUsers.length,
      maxPlayers: r.maxPlayers,
      createdAt: r.createdAt,
    }));
    res.json(result);
  } catch (err: any) {
    next(err);
  }
});

// Get room details
router.get('/rooms/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const room = await getRoomWithDetails(id);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const players = room.roomUsers
      .filter(u => u.role === 'PLAYER_BLACK' || u.role === 'PLAYER_WHITE')
      .map(u => ({ id: u.user.id, nickname: u.user.nickname, role: u.role }));

    const spectators = room.roomUsers
      .filter(u => u.role === 'SPECTATOR')
      .map(u => ({ id: u.user.id, nickname: u.user.nickname }));

    res.json({
      id: room.id,
      roomName: room.roomName,
      status: room.status,
      maxPlayers: room.maxPlayers,
      owner: { id: room.owner.id, nickname: room.owner.nickname },
      players,
      spectators,
      createdAt: room.createdAt,
    });
  } catch (err: any) {
    next(err);
  }
});

// Join room
router.post('/rooms/:id/join', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    const nickname = (req as any).user.nickname;

    const result = await joinRoom(id, userId, nickname);
    res.json(result);
  } catch (err: any) {
    if (err.code) {
      return res.status(409).json({ error: err.message, code: err.code });
    }
    next(err);
  }
});

// Leave room
router.post('/rooms/:id/leave', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    await leaveRoom(id, userId);
    res.json({ message: 'Left room' });
  } catch (err: any) {
    next(err);
  }
});

export default router;
