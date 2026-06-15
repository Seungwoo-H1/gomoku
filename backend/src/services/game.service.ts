// Game service — persist game state to DB

import { PrismaClient, GameStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface SaveGameInput {
  roomId: string;
  boardState: string; // JSON string of board
  turn: number;
  winnerId?: string;
  status: GameStatus;
}

export async function saveGame(input: SaveGameInput) {
  return prisma.game.upsert({
    where: { roomId: input.roomId },
    create: {
      roomId: input.roomId,
      boardState: input.boardState,
      turn: input.turn,
      winnerId: input.winnerId,
      status: input.status,
    },
    update: {
      boardState: input.boardState,
      turn: input.turn,
      winnerId: input.winnerId,
      status: input.status,
    },
  });
}

export async function getGame(roomId: string) {
  return prisma.game.findUnique({
    where: { roomId },
    include: {
      winner: { select: { id: true, nickname: true } },
    },
  });
}

export async function createInitialGame(roomId: string) {
  return prisma.game.create({
    data: {
      roomId,
      boardState: 'initial', // signal frontend to create fresh board
      turn: 0, // black's turn
      status: GameStatus.ACTIVE,
    },
  });
}
