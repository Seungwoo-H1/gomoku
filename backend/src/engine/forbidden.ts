// Forbidden move detection — pure functions
// 3-3, 4-4, and overline (6+) rules for Black (stone = 1)

import { Stone, Board, DIRECTION_VECTORS, isOnBoard, getOpenEnds } from './types';

function isOpenThreeInDir(
  board: Board,
  row: number,
  col: number,
  dr: number,
  dc: number,
  stone: Stone
): boolean {
  const open = getOpenEnds(board, row, col, dr, dc, stone);
  if (!open.forward || !open.backward) return false;

  let count = 1;
  let r = row + dr;
  let c = col + dc;
  while (isOnBoard(r, c) && board[r][c] === stone) { count++; r += dr; c += dc; }
  r = row - dr;
  c = col - dc;
  while (isOnBoard(r, c) && board[r][c] === stone) { count++; r -= dr; c -= dc; }

  return count === 3;
}

function hasFourInDir(
  board: Board,
  row: number,
  col: number,
  dr: number,
  dc: number,
  stone: Stone
): boolean {
  const open = getOpenEnds(board, row, col, dr, dc, stone);
  if (!open.forward && !open.backward) return false;

  let count = 1;
  let r = row + dr;
  let c = col + dc;
  while (isOnBoard(r, c) && board[r][c] === stone) { count++; r += dr; c += dc; }
  r = row - dr;
  c = col - dc;
  while (isOnBoard(r, c) && board[r][c] === stone) { count++; r -= dr; c -= dc; }

  return count >= 4;
}

function hasOverline(board: Board, row: number, col: number, stone: Stone): boolean {
  for (const [dr, dc] of DIRECTION_VECTORS) {
    let count = 1;
    let r = row + dr;
    let c = col + dc;
    while (isOnBoard(r, c) && board[r][c] === stone) { count++; r += dr; c += dc; }
    r = row - dr;
    c = col - dc;
    while (isOnBoard(r, c) && board[r][c] === stone) { count++; r -= dr; c -= dc; }
    if (count >= 6) return true;
  }
  return false;
}

function countDirs(openCheck: (dr: number, dc: number) => boolean): number {
  let count = 0;
  for (const [dr, dc] of DIRECTION_VECTORS) {
    if (openCheck(dr, dc)) count++;
  }
  return count;
}

export function checkForbidden(
  board: Board,
  row: number,
  col: number,
  stone: Stone,
  rules: {
    threeThreeForbidden: boolean;
    fourFourForbidden: boolean;
    overlineForbidden: boolean;
  }
): { type: 'three-three' | 'four-four' | 'overline'; position: { row: number; col: number } } | null {
  if (stone === 2) return null;

  if (rules.overlineForbidden && hasOverline(board, row, col, stone)) {
    return { type: 'overline', position: { row, col } };
  }

  if (rules.fourFourForbidden &&
      countDirs((dr, dc) => hasFourInDir(board, row, col, dr, dc, stone)) >= 2) {
    return { type: 'four-four', position: { row, col } };
  }

  if (rules.threeThreeForbidden &&
      countDirs((dr, dc) => isOpenThreeInDir(board, row, col, dr, dc, stone)) >= 2) {
    return { type: 'three-three', position: { row, col } };
  }

  return null;
}
