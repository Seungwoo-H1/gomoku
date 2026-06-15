import { describe, it, expect } from 'vitest';
import { createBoard, BOARD_SIZE } from '../src/engine/board';
import { checkWin } from '../src/engine/winCheck';
import { makeMove, createGameStats, getTurn } from '../src/engine/game';
import { checkForbidden } from '../src/engine/forbidden';
import { Stone, BOARD_SIZE as SIZE } from '../src/engine/types';

describe('Board', () => {
  it('creates empty 15x15 board', () => {
    const board = createBoard();
    expect(board).toHaveLength(SIZE);
    expect(board[0]).toHaveLength(SIZE);
    expect(board[0][0]).toBe(0);
  });
});

describe('Win Detection', () => {
  it('detects horizontal 5-in-a-row', () => {
    const board = createBoard();
    board[7][3] = 1;
    board[7][4] = 1;
    board[7][5] = 1;
    board[7][6] = 1;
    board[7][7] = 1;
    expect(checkWin(board, 7, 7)).toBe(1);
  });

  it('detects vertical 5-in-a-row', () => {
    const board = createBoard();
    board[3][7] = 2;
    board[4][7] = 2;
    board[5][7] = 2;
    board[6][7] = 2;
    board[7][7] = 2;
    expect(checkWin(board, 7, 7)).toBe(2);
  });

  it('detects diagonal 5-in-a-row', () => {
    const board = createBoard();
    board[3][3] = 1;
    board[4][4] = 1;
    board[5][5] = 1;
    board[6][6] = 1;
    board[7][7] = 1;
    expect(checkWin(board, 7, 7)).toBe(1);
  });

  it('detects anti-diagonal 5-in-a-row', () => {
    const board = createBoard();
    board[3][11] = 2;
    board[4][10] = 2;
    board[5][9] = 2;
    board[6][8] = 2;
    board[7][7] = 2;
    expect(checkWin(board, 7, 7)).toBe(2);
  });

  it('returns null for less than 5 in a row', () => {
    const board = createBoard();
    board[7][5] = 1;
    board[7][6] = 1;
    board[7][7] = 1;
    expect(checkWin(board, 7, 7)).toBeNull();
  });

  it('returns null for empty position', () => {
    const board = createBoard();
    expect(checkWin(board, 7, 7)).toBeNull();
  });

  it('detects overline (6+) as win', () => {
    const board = createBoard();
    board[7][2] = 1;
    board[7][3] = 1;
    board[7][4] = 1;
    board[7][5] = 1;
    board[7][6] = 1;
    board[7][7] = 1;
    expect(checkWin(board, 7, 7)).toBe(1);
  });
});

describe('Move Validation', () => {
  it('places stone correctly', () => {
    const board = createBoard();
    const result = makeMove(board, 7, 7, 1);
    expect(result.success).toBe(true);
    expect(result.board![7][7]).toBe(1);
  });

  it('rejects out of bounds', () => {
    const board = createBoard();
    const result = makeMove(board, 15, 7, 1);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Position out of bounds');
  });

  it('rejects occupied position', () => {
    const board = createBoard();
    board[7][7] = 1;
    const result = makeMove(board, 7, 7, 2);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Position already occupied');
  });

  it('returns winner on 5-in-a-row', () => {
    const board = createBoard();
    board[7][3] = 1;
    board[7][4] = 1;
    board[7][5] = 1;
    board[7][6] = 1;
    const result = makeMove(board, 7, 7, 1);
    expect(result.success).toBe(true);
    expect(result.winner).toBe(1);
  });
});

describe('Turn Management', () => {
  it('alternates turns', () => {
    expect(getTurn(1)).toBe(2);
    expect(getTurn(2)).toBe(1);
  });

  it('starts with black', () => {
    const stats = createGameStats();
    expect(stats.turn).toBe(1);
  });
});

describe('Game State', () => {
  it('creates initial game state', () => {
    const stats = createGameStats();
    expect(stats.board).toHaveLength(SIZE);
    expect(stats.turn).toBe(1);
    expect(stats.lastMove).toBeNull();
    expect(stats.winner).toBeNull();
    expect(stats.isFinished).toBe(false);
  });
});

describe('Forbidden Moves', () => {
  it('allows single open 3 for black', () => {
    const board = createBoard();
    board[7][5] = 1;
    board[7][6] = 1;
    board[7][7] = 1;
    board[7][4] = 0; // position to place
    // This creates one open 3, should NOT be forbidden
    const result = checkForbidden(board, 7, 4, 1, {
      threeThreeForbidden: true,
      fourFourForbidden: true,
      overlineForbidden: true,
    });
    expect(result).toBeNull();
  });

  it('allows white to play anywhere', () => {
    const board = createBoard();
    const result = checkForbidden(board, 7, 7, 2, {
      threeThreeForbidden: true,
      fourFourForbidden: true,
      overlineForbidden: true,
    });
    expect(result).toBeNull();
  });
});
