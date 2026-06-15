// GameStatus component

import type { GameState, PlayerInfo } from '../../types/api';
import { stoneName } from '../../types/game';

interface GameStatusProps {
  gameState: GameState | null;
  myPlayer: PlayerInfo | null;
  players: PlayerInfo[];
  onRestart: () => void;
}

export default function GameStatus({ gameState, myPlayer, players, onRestart }: GameStatusProps) {
  const black = players.find(p => p.role === 'PLAYER_BLACK');
  const white = players.find(p => p.role === 'PLAYER_WHITE');
  const isFinished = gameState?.status === 'FINISHED';
  const isMyTurn = gameState?.turn !== undefined && myPlayer &&
    ((gameState.turn === 0 && myPlayer.role === 'PLAYER_BLACK') ||
     (gameState.turn === 1 && myPlayer.role === 'PLAYER_WHITE'));

  return (
    <div className="space-y-3">
      {/* Game status */}
      <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-3">
        <div className="text-sm font-medium text-gray-400 mb-2">게임 상태</div>
        {isFinished ? (
          <div className="text-green-400 font-bold text-center text-lg">
            🏆 {gameState?.winner?.nickname} 승리!
          </div>
        ) : (
          <div className="text-center">
            {gameState ? (
              <>
                <span className={isMyTurn ? 'text-green-400 font-bold' : 'text-gray-300'}>
                  {isMyTurn ? '✅ 내 턴!' : '⏳ 상대 차례'}
                </span>
                <div className="text-xs text-gray-500 mt-1">
                  {gameState.turn === 0 ? '⚫' : '⚪'} {stoneName(gameState.turn as 1 | 2)}의 턴
                </div>
              </>
            ) : (
              <span className="text-yellow-400">대기 중...</span>
            )}
          </div>
        )}
      </div>

      {/* Players */}
      <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-3">
        <div className="text-sm font-medium text-gray-400 mb-2">플레이어</div>
        <div className="space-y-2">
          {black && (
            <div className={`flex items-center gap-2 ${black.id === myPlayer?.id ? 'text-blue-400' : ''}`}>
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-700 to-gray-900" />
              <span className="text-sm">{black.nickname}</span>
              <span className="text-xs text-gray-500">({black.role === 'PLAYER_BLACK' ? '흑' : ''})</span>
              {black.id === myPlayer?.id && <span className="text-xs text-blue-400">(나)</span>}
            </div>
          )}
          {white && (
            <div className={`flex items-center gap-2 ${white.id === myPlayer?.id ? 'text-blue-400' : ''}`}>
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-300" />
              <span className="text-sm">{white.nickname}</span>
              <span className="text-xs text-gray-500">({white.role === 'PLAYER_WHITE' ? '백' : ''})</span>
              {white.id === myPlayer?.id && <span className="text-xs text-blue-400">(나)</span>}
            </div>
          )}
        </div>
      </div>

      {/* Restart button */}
      {isFinished && myPlayer?.role === 'OWNER' && (
        <button
          onClick={onRestart}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors"
        >
          🔄 재대국
        </button>
      )}

      {isFinished && myPlayer?.role !== 'OWNER' && (
        <div className="text-center text-gray-500 text-sm">
          소유자가 재대국을 시작할 수 있습니다
        </div>
      )}
    </div>
  );
}
