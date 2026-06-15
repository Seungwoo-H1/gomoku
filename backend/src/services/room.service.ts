// Room service

import { PrismaClient, RoomStatus, PlayerRole } from '@prisma/client';

const prisma = new PrismaClient();

export async function createRoom(
  ownerId: string,
  roomName: string,
  maxPlayers = 2
) {
  return prisma.room.create({
    data: {
      roomName,
      maxPlayers,
      owner: { connect: { id: ownerId } },
      roomUsers: {
        create: {
          user: { connect: { id: ownerId } },
          role: PlayerRole.OWNER,
        },
      },
    },
    include: {
      owner: { select: { id: true, nickname: true } },
      roomUsers: { include: { user: { select: { id: true, nickname: true } } } },
    },
  });
}

export async function getRoomList() {
  return prisma.room.findMany({
    where: { status: RoomStatus.LOBBY },
    select: {
      id: true,
      roomName: true,
      status: true,
      maxPlayers: true,
      createdAt: true,
      roomUsers: {
        select: { id: true },
      },
    },
  });
}

export async function getRoomWithDetails(roomId: string) {
  return prisma.room.findUnique({
    where: { id: roomId },
    include: {
      owner: { select: { id: true, nickname: true } },
      roomUsers: {
        include: { user: { select: { id: true, nickname: true } } },
      },
      game: { select: { id: true, status: true } },
    },
  });
}

export async function joinRoom(
  roomId: string,
  userId: string,
  userNickname: string
) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      roomUsers: { select: { userId: true, role: true } },
    },
  });

  if (!room) throw { code: 'ROOM_NOT_FOUND', message: 'Room not found' };
  if (room.status !== RoomStatus.LOBBY) throw { code: 'ROOM_FULL', message: 'Room is not in lobby' };

  // Check if already a member
  const existing = room.roomUsers.find(u => u.userId === userId);
  if (existing) throw { code: 'ALREADY_IN_ROOM', message: 'Already in this room' };

  // Check if full
  const playerCount = room.roomUsers.filter(
    u => u.role === PlayerRole.PLAYER_BLACK || u.role === PlayerRole.PLAYER_WHITE
  ).length;
  if (playerCount >= room.maxPlayers) throw { code: 'ROOM_FULL', message: 'Room is full' };

  // Determine role
  const hasBlack = room.roomUsers.some(u => u.role === PlayerRole.PLAYER_BLACK);
  const role = hasBlack ? PlayerRole.PLAYER_WHITE : PlayerRole.PLAYER_BLACK;

  const updatedRoom = await prisma.room.update({
    where: { id: roomId },
    data: {
      roomUsers: {
        create: {
          user: { connect: { id: userId } },
          role,
        },
      },
    },
    include: {
      owner: { select: { id: true, nickname: true } },
      roomUsers: {
        include: { user: { select: { id: true, nickname: true } } },
      },
    },
  });

  return {
    room: {
      id: updatedRoom.id,
      roomName: updatedRoom.roomName,
      status: updatedRoom.status,
      maxPlayers: updatedRoom.maxPlayers,
    },
    player: {
      id: userId,
      nickname: userNickname,
      role,
    },
  };
}

export async function leaveRoom(roomId: string, userId: string) {
  return prisma.roomUser.deleteMany({
    where: { roomId, userId },
  });
}
