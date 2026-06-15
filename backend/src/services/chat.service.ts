// Chat service

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function sendChat(roomId: string, userId: string, message: string) {
  return prisma.chat.create({
    data: {
      roomId,
      userId,
      message,
    },
    include: {
      user: { select: { id: true, nickname: true } },
    },
  });
}

export async function getChatHistory(roomId: string, limit = 50) {
  return prisma.chat.findMany({
    where: { roomId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: { select: { id: true, nickname: true } },
    },
  });
}
