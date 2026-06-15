# Gomoku Game Engine

## Board Representation

- 15×15 grid
- `0` = empty, `1` = black (선공), `2` = white (후공)
- Board stored as `number[][]` (15 rows × 15 columns)

## Rules

### Basic
- Black (선공) goes first
- Players alternate placing stones
- 5-in-a-row (horizontal, vertical, diagonal) = win
- Game ends when 5-in-a-row or board is full

### Forbidden Moves (optional, toggleable)
- **3-3 금지**: Placing a stone that creates two or more "open 3"s simultaneously
- **4-4 금지**: Placing a stone that creates two or more "4"s (including overline)
- **장목 금지 (Overline)**: More than 5 in a row

These are enforced for Black only (standard Gomoku rules).

## Engine Functions (Pure)

| Function | Input | Output | Description |
|----------|-------|--------|-------------|
| `createBoard()` | — | `Board` | 15×15 empty board |
| `placeStone(board, row, col, stone)` | board, position, stone | `Board \| null` | Place stone, null if invalid |
| `checkWin(board, row, col)` | board, last position | `1 \| 2 \| null` | Check if last move wins |
| `checkForbidden(board, row, col)` | board, position, stone | `Forbidden \| null` | Check 3-3/4-4/overline |
| `isValidMove(board, row, col, stone, rules?)` | board, pos, stone, rules | `boolean` | Full validity check |
| `getTurn(stone)` | stone | `1 \| 2` | Get next turn |
| `isBoardFull(board)` | board | `boolean` | Check if board is full |

## Board Types

```typescript
type Stone = 0 | 1 | 2; // 0=empty, 1=black, 2=white
type Board = Stone[][];
type Position = { row: number; col: number };
type BoardState = Stone[][];

interface GameRuleOptions {
  threeThreeForbidden: boolean;
  fourFourForbidden: boolean;
  overlineForbidden: boolean;
}

interface ForbiddenResult {
  type: 'three-three' | 'four-four' | 'overline';
  position: Position;
}
```
