// Auth routes

import { Router } from 'express';
import { loginOrCreateUser } from '../services/auth.service';

const router = Router();

router.post('/auth/login', async (req, res, next) => {
  try {
    const { nickname } = req.body;
    if (!nickname || typeof nickname !== 'string' || nickname.trim().length === 0) {
      return res.status(400).json({ error: 'Nickname required' });
    }

    const result = await loginOrCreateUser(nickname.trim());
    res.json(result);
  } catch (err: any) {
    next(err);
  }
});

export default router;
