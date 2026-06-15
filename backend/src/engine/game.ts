// Main game engine — orchestrates all pure functions

import {
  Stone, Board, MoveResult, GameStats, Position,
  BOARD_SIZE, BLACK, WHITE, DEFAULT_RULES, GameRuleOptions,
} from './types';
import { createBoard, placeStone, getStone, isBoardFull } from './board';
import { isOnBoard } from './types';
import { checkWin } from './winCheck';
import { checkForbidden } from './forbidden';

/**
 * Validate and execute a move.
 * Returns MoveResult with success status, updated board, winner, or error.
 */
export function makeMove(
  board: Board,
  row: number,
  col: number,
  stone: Stone,
  rules: GameRuleOptions = DEFAULT_RULES
): MoveResult {
  // Check bounds
  if (!isOnBoard(row, col)) {
    return { success: false, error: 'Position out of bounds' };
  }

  // Check if position is already occupied
  if (getStone(board, row, col) !== 0) {
    return { success: false, error: 'Position already occupied' };
  }

  // Check forbidden moves (black only)
  if (stone === BLACK) {
    const forbidden = checkForbidden(board, row, col, stone, rules);
    if (forbidden) {
      return { success: false, error: `Forbidden move: ${forbidden.type}`, forbidden };
    }
  }

  // Place the stone
  const newBoard = placeStone(board, row, col, stone);

  // Check for win
  const winner = checkWin(newBoard, row, col);
  if (winner) {
    return { success: true, board: newBoard, winner };
  }

  // Check for draw
  if (isBoardFull(newBoard)) {
    return { success: true, board: newBoard };
  }

  return { success: true, board: newBoard };
}

/**
 * Get the next turn's stone.
 */
export function getTurn(nextAfter: Stone): Stone {
  return nextAfter === BLACK ? WHITE : BLACK;
}

/**
 * Create initial game stats.
 */
export function createGameStats(): GameStats {
  return {
    board: createBoard(),
    turn: BLACK,
    lastMove: null,
    winner: null,
    isFinished: false,
  };
}

/**
 * Validate a move for a given game state.
 */
export function validateMove(
  stats: GameStats,
  row: number,
  col: number,
  stone: Stone,
  rules: GameRuleOptions = DEFAULT_RULES
): MoveResult {
  // Check if game is finished
  if (stats.isFinished) {
    return { success: false, error: 'Game is already finished' };
  }

  // Check if it's this player's turn
  if (stone !== stats.turn) {
    return { success: false, error: 'Not your turn' };
  }

  // Execute the move
  return makeMove(stats.board, row, col, stone, rules);
}
