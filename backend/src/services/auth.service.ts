// Auth service

import { PrismaClient } from '@prisma/client';
import { signToken } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export interface LoginResult {
  token: string;
  user: { id: string; nickname: string; createdAt: Date };
}

export async function loginOrCreateUser(nickname: string): Promise<LoginResult> {
  let user = await prisma.user.findUnique({ where: { nickname } });

  if (!user) {
    user = await prisma.user.create({
      data: { nickname },
    });
  }

  const token = signToken(user.id, user.nickname);
  return { token, user: { id: user.id, nickname: user.nickname, createdAt: user.createdAt } };
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}
