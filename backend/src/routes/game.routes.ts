// Game routes

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getGame } from '../services/game.service';

const router = Router();

// Get game state
router.get('/games/:roomId', authMiddleware, async (req, res, next) => {
  try {
    const roomId = typeof req.params.roomId === 'string' ? req.params.roomId : req.params.roomId[0];
    const game = await getGame(roomId);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json({
      id: game.id,
      roomId: game.roomId,
      boardState: game.boardState,
      turn: game.turn,
      winner: game.winner ? { id: game.winner.id, nickname: game.winner.nickname } : null,
      status: game.status,
    });
  } catch (err: any) {
    next(err);
  }
});

export default router;
