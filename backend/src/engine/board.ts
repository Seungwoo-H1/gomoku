// Board operations — pure functions

import { BOARD_SIZE, Stone, Board, Position, BLACK, WHITE } from './types';

export function createBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => 0 as Stone)
  );
}

export function cloneBoard(board: Board): Board {
  return board.map(row => [...row]);
}

export function placeStone(board: Board, row: number, col: number, stone: Stone): Board {
  const newBoard = cloneBoard(board);
  newBoard[row][col] = stone;
  return newBoard;
}

export function getStone(board: Board, row: number, col: number): Stone {
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return -1;
  return board[row][col];
}

export function isOnBoard(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export function isBoardFull(board: Board): boolean {
  return board.every(row => row.every(stone => stone !== 0));
}

export function countInDirection(
  board: Board,
  row: number,
  col: number,
  dr: number,
  dc: number,
  stone: Stone
): number {
  let count = 0;
  let r = row + dr;
  let c = col + dc;
  while (isOnBoard(r, c) && board[r][c] === stone) {
    count++;
    r += dr;
    c += dc;
  }
  return count;
}

/**
 * Count consecutive stones in both directions from the given position.
 * Includes the stone at (row, col) itself.
 */
export function countConsecutive(board: Board, row: number, col: number, dr: number, dc: number, stone: Stone): number {
  let count = 1; // count the stone itself

  // Forward
  let r = row + dr;
  let c = col + dc;
  while (isOnBoard(r, c) && board[r][c] === stone) {
    count++;
    r += dr;
    c += dc;
  }

  // Backward
  r = row - dr;
  c = col - dc;
  while (isOnBoard(r, c) && board[r][c] === stone) {
    count++;
    r -= dr;
    c -= dc;
  }

  return count;
}

export function getOpenEnds(board: Board, row: number, col: number, dr: number, dc: number, stone: Stone): { forward: boolean; backward: boolean } {
  // Forward open end
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

  // Backward open end
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
