// Game Engine Types

export type Stone = 0 | 1 | 2; // 0=empty, 1=black, 2=white
export type Board = Stone[][];
export type Position = { row: number; col: number };
export type BoardState = Stone[][];

export interface GameRuleOptions {
  threeThreeForbidden: boolean;
  fourFourForbidden: boolean;
  overlineForbidden: boolean;
}

export interface ForbiddenResult {
  type: 'three-three' | 'four-four' | 'overline';
  position: Position;
}

export interface MoveResult {
  success: boolean;
  board?: Board;
  error?: string;
  winner?: Stone;
  forbidden?: ForbiddenResult;
}

export interface GameStats {
  board: Board;
  turn: Stone;
  lastMove: Position | null;
  winner: Stone | null;
  isFinished: boolean;
}

export type PlayerRole = 'OWNER' | 'PLAYER_BLACK' | 'PLAYER_WHITE' | 'SPECTATOR';

export const BOARD_SIZE = 15;
export const WIN_LENGTH = 5;

export const DEFAULT_RULES: GameRuleOptions = {
  threeThreeForbidden: false,
  fourFourForbidden: false,
  overlineForbidden: false,
};

export const BLACK: Stone = 1 as Stone;
export const WHITE: Stone = 2 as Stone;

export function isOnBoard(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export function getOpenEnds(board: Board, row: number, col: number, dr: number, dc: number, stone: Stone): { forward: boolean; backward: boolean } {
  let forwardOpen = false;
  let r = row + dr;
  let c = col + dc;
  while (isOnBoard(r, c) && board[r][c] === stone) {
    r += dr;
    c += dc;
  }
  if (isOnBoard(r, c) && board[r][c] === 0) {
    forwardOpen = true;
  }
  let backwardOpen = false;
  r = row - dr;
  c = col - dc;
  while (isOnBoard(r, c) && board[r][c] === stone) {
    r -= dr;
    c -= dc;
  }
  if (isOnBoard(r, c) && board[r][c] === 0) {
    backwardOpen = true;
  }
  return { forward: forwardOpen, backward: backwardOpen };
}

export const DIRECTION_VECTORS = [
  [0, 1],   // horizontal
  [1, 0],   // vertical
  [1, 1],   // diagonal \
  [1, -1],  // anti-diagonal /
] as const;
