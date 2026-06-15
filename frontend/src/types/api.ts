// API types

export interface User {
  id: string;
  nickname: string;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Room {
  id: string;
  roomName: string;
  status: 'LOBBY' | 'PLAYING' | 'FINISHED';
  maxPlayers: number;
  playerCount: number;
  createdAt: string;
}

export interface RoomDetail {
  id: string;
  roomName: string;
  status: string;
  maxPlayers: number;
  owner: { id: string; nickname: string };
  players: PlayerInfo[];
  spectators: { id: string; nickname: string }[];
  createdAt: string;
}

export interface PlayerInfo {
  id: string;
  nickname: string;
  role: 'OWNER' | 'PLAYER_BLACK' | 'PLAYER_WHITE' | 'SPECTATOR';
}

export interface BoardState {
  rows: number;
  cols: number;
  stones: number[][];
}

export interface GameState {
  id: string;
  roomId: string;
  boardState: BoardState;
  turn: number;
  winner: { id: string; nickname: string } | null;
  status: 'ACTIVE' | 'FINISHED';
}

export interface ChatMessage {
  id: string;
  userId: string;
  nickname: string;
  message: string;
  createdAt: string;
}
