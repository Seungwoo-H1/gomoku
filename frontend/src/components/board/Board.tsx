// Board component — renders the 15x15 Gomoku board

import { BOARD_SIZE, type Stone, stoneColor } from '../../types/game';

interface BoardProps {
  board: Stone[][];
  onCellClick: (row: number, col: number) => void;
  lastMove: { row: number; col: number } | null;
  disabled: boolean;
  isMyTurn: boolean;
}

// Star points for 15x15 board
const STAR_POINTS = [
  [3, 3], [3, 7], [3, 11],
  [7, 3], [7, 7], [7, 11],
  [11, 3], [11, 7], [11, 11],
];

export default function Board({ board, onCellClick, lastMove, disabled, isMyTurn }: BoardProps) {
  const cellSize = 'w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8';

  return (
    <div className="select-none">
      {/* Column labels */}
      <div className="flex pl-5">
        {Array.from({ length: BOARD_SIZE }, (_, i) => (
          <div key={i} className={`${cellSize} flex items-center justify-center text-[8px] text-gray-500`}>
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>

      {board.map((row, rowIdx) => (
        <div key={rowIdx} className="flex items-center">
          {/* Row label */}
          <div className={`${cellSize} flex items-center justify-center text-[8px] text-gray-500 w-5`}>
            {BOARD_SIZE - rowIdx}
          </div>

          {row.map((stone, colIdx) => {
            const isLast = lastMove?.row === rowIdx && lastMove?.col === colIdx;
            const isStar = STAR_POINTS.some(([r, c]) => r === rowIdx && c === colIdx);
            const canClick = !disabled && isMyTurn && stone === 0;

            return (
              <div
                key={colIdx}
                className={`
                  ${cellSize} relative border-r border-b border-gray-600/50
                  ${canClick ? 'cursor-pointer hover:bg-white/20' : 'cursor-default'}
                `}
                onClick={() => canClick && onCellClick(rowIdx, colIdx)}
              >
                {/* Grid lines */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute w-full h-px bg-gray-600/50" />
                  <div className="absolute h-full w-px bg-gray-600/50" />
                </div>

                {/* Star point */}
                {isStar && (
                  <div className="star-point z-0" />
                )}

                {/* Ghost stone (hover) */}
                {canClick && stone === 0 && (
                  <div className={`w-[70%] h-[70%] rounded-full bg-black/20 z-10`} />
                )}

                {/* Stone */}
                {stone !== 0 && (
                  <div className={`stone ${stoneColor(stone)} z-10 relative`}>
                    {isLast && (
                      <div className="last-move-indicator top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
