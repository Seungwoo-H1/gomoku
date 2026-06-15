// Chat routes

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { sendChat, getChatHistory } from '../services/chat.service';

const router = Router();

// Get chat history
router.get('/chat/:roomId', authMiddleware, async (req, res, next) => {
  try {
    const roomId = typeof req.params.roomId === 'string' ? req.params.roomId : req.params.roomId[0];
    const chats = await getChatHistory(roomId);

    const result = chats.map(c => ({
      id: c.id,
      userId: c.userId,
      nickname: c.user.nickname,
      message: c.message,
      createdAt: c.createdAt,
    }));
    res.json(result);
  } catch (err: any) {
    next(err);
  }
});

// Send chat (REST fallback)
router.post('/chat/:roomId', authMiddleware, async (req, res, next) => {
  try {
    const roomId = typeof req.params.roomId === 'string' ? req.params.roomId : req.params.roomId[0];
    const userId = (req as any).user.userId;
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message required' });
    }

    const chat = await sendChat(roomId, userId, message);

    res.status(201).json({
      id: chat.id,
      userId: chat.userId,
      nickname: chat.user.nickname,
      message: chat.message,
      createdAt: chat.createdAt,
    });
  } catch (err: any) {
    next(err);
  }
});

export default router;
