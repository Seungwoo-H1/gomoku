// Game types

export type Stone = 0 | 1 | 2; // 0=empty, 1=black, 2=white

export interface Position {
  row: number;
  col: number;
}

export const BOARD_SIZE = 15;

export const BLACK: Stone = 1;
export const WHITE: Stone = 2;

export function stoneName(stone: Stone): string {
  return stone === 1 ? 'BLACK' : 'WHITE';
}

export function stoneColor(stone: Stone): string {
  return stone === 1 ? 'stone-black' : 'stone-white';
}
