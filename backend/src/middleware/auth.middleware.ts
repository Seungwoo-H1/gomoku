// Auth service — JWT operations

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface JwtPayload {
  userId: string;
  nickname: string;
}

export function signToken(userId: string, nickname: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');
  return jwt.sign({ userId, nickname }, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

export function verifyToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');
  return jwt.verify(token, secret) as JwtPayload;
}

// Express middleware
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.substring(7);
  try {
    const payload = verifyToken(token);
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }
}

// Socket.IO middleware
export function socketAuthMiddleware(socket: any, next: (err?: any) => void): void {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    next(new Error('Unauthorized: No token provided'));
    return;
  }

  try {
    const payload = verifyToken(token as string);
    socket.data.user = payload;
    next();
  } catch {
    next(new Error('Unauthorized: Invalid token'));
  }
}
