// API client with Axios

import axios from 'axios';
import type {
  LoginResponse,
  Room,
  RoomDetail,
  GameState,
  ChatMessage,
} from '../types/api';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gomoku_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function login(nickname: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', { nickname });
  localStorage.setItem('gomoku_token', data.token);
  localStorage.setItem('gomoku_user', JSON.stringify(data.user));
  return data;
}

export function logout(): void {
  localStorage.removeItem('gomoku_token');
  localStorage.removeItem('gomoku_user');
}

export function getToken(): string | null {
  return localStorage.getItem('gomoku_token');
}

export function getUser(): any {
  const user = localStorage.getItem('gomoku_user');
  return user ? JSON.parse(user) : null;
}

export async function getRooms(): Promise<Room[]> {
  const { data } = await api.get<Room[]>('/rooms');
  return data;
}

export async function createRoom(roomName: string, maxPlayers = 2): Promise<RoomDetail> {
  const { data } = await api.post<RoomDetail>('/rooms', { roomName, maxPlayers });
  return data;
}

export async function getRoomDetail(roomId: string): Promise<RoomDetail> {
  const { data } = await api.get<RoomDetail>(`/rooms/${roomId}`);
  return data;
}

export async function joinRoom(roomId: string): Promise<any> {
  const { data } = await api.post<any>(`/rooms/${roomId}/join`);
  return data;
}

export async function leaveRoom(roomId: string): Promise<void> {
  await api.post(`/rooms/${roomId}/leave`);
}

export async function getGame(roomId: string): Promise<GameState> {
  const { data } = await api.get<GameState>(`/games/${roomId}`);
  return data;
}

export async function getChat(roomId: string): Promise<ChatMessage[]> {
  const { data } = await api.get<ChatMessage[]>(`/chat/${roomId}`);
  return data.reverse();
}

export async function sendChat(roomId: string, message: string): Promise<ChatMessage> {
  const { data } = await api.post<ChatMessage>(`/chat/${roomId}`, { message });
  return data;
}

export default api;
