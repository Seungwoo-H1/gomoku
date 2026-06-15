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
  turn: Stone; // whose turn next
  lastMove: Position | null;
  winner: Stone | null;
  isFinished: boolean;
}

export const BOARD_SIZE = 15;
export const WIN_LENGTH = 5;

export const DEFAULT_RULES: GameRuleOptions = {
  threeThreeForbidden: false,
  fourFourForbidden: false,
  overlineForbidden: false,
};

export const BLACK: Stone = 1;
export const WHITE: Stone = 2;

export const DIRECTION_VECTORS = [
  [0, 1],   // horizontal
  [1, 0],   // vertical
  [1, 1],   // diagonal \
  [1, -1],  // anti-diagonal /
] as const;
