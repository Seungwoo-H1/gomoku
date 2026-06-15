// Win detection — pure function

import { Stone, Board, DIRECTION_VECTORS, BOARD_SIZE, isOnBoard } from './types';

/**
 * Check if placing a stone at (row, col) creates 5-in-a-row.
 * Returns the winning stone (1=black, 2=white) or null.
 */
export function checkWin(board: Board, row: number, col: number): Stone | null {
  const stone = board[row][col];
  if (stone === 0) return null;

  for (const [dr, dc] of DIRECTION_VECTORS) {
    let count = 1;

    // Count in positive direction
    let r = row + dr;
    let c = col + dc;
    while (isOnBoard(r, c) && board[r][c] === stone) {
      count++;
      r += dr;
      c += dc;
    }

    // Count in negative direction
    r = row - dr;
    c = col - dc;
    while (isOnBoard(r, c) && board[r][c] === stone) {
      count++;
      r -= dr;
      c -= dc;
    }

    if (count >= 5) {
      return stone;
    }
  }

  return null;
}
