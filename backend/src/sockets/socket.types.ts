// Socket.IO types and event types

export type PlayerRole = 'OWNER' | 'PLAYER_BLACK' | 'PLAYER_WHITE' | 'SPECTATOR';

export interface UserSocketData {
  userId: string;
  nickname: string;
}

export interface RoomMembership {
  roomId: string;
  role: PlayerRole;
}

export interface SocketUser {
  socketId: string;
  userId: string;
  nickname: string;
  memberships: RoomMembership[];
}

export interface BoardState {
  rows: number;
  cols: number;
  stones: number[][];
}

export interface GameSnapshot {
  boardState: BoardState | null;
  turn: number;
  winner: string | null;
  status: 'ACTIVE' | 'FINISHED';
}
