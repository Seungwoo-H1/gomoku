// GamePage — Main game screen with board, players, chat

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSocket, disconnectSocket, reconnectSocket } from '../lib/socket';
import { joinRoom, leaveRoom, getGame, getChat, type ChatMessage, type GameState, type PlayerInfo } from '../lib/api';
import { BOARD_SIZE, type Stone, BLACK } from '../types/game';
import Board from '../components/board/Board';
import GameStatus from '../components/game/GameStatus';
import ChatBox from '../components/chat/ChatBox';

export default function GamePage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [board, setBoard] = useState<Stone[][]>(() =>
    Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0) as Stone[])
  );
  const [turn, setTurn] = useState<number>(0);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [myRole, setMyRole] = useState<string>('');
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const isBlack = myRole === 'PLAYER_BLACK';
  const isMyTurn = turn === (isBlack ? 0 : 1);
  const isSpectator = myRole === 'SPECTATOR';

  // Initialize room on mount
  useEffect(() => {
    if (!roomId || !user) return;
    initRoom();

    return () => {
      cleanup();
    };
  }, [roomId, user]);

  const initRoom = async () => {
    if (!roomId || !user) return;
    setLoading(true);
    setError(null);

    try {
      // Join room via socket
      const socket = getSocket();

      // First try REST join for initial data
      try {
        await joinRoom(roomId);
      } catch {
        // Might already be in room, continue
      }

      // Listen for socket events
      socket.emit('join-room', { roomId }, async (ack: any) => {
        if (ack.error) {
          setError(ack.message);
          setLoading(false);
          return;
        }
        // Initial state will come via room-joined
      });

      // room-joined: get full state
      socket.on('room-joined', async (data: any) => {
        setPlayers(data.players || []);
        setGameState(data.game);
        if (data.game?.boardState) {
          setBoard(data.game.boardState.stones as Stone[][]);
          setTurn(data.game.turn);
          setGameStarted(true);
        }
        setChatMessages(data.recentChats || []);

        // Find my role
        if (user) {
          const myPlayer = [...(data.players || []), ...(data.spectators || [])]
            .find((p: any) => p.userId === user.id);
          if (myPlayer) {
            setMyRole(myPlayer.role);
          }
        }
        setLoading(false);
      });

      // move-accepted
      socket.on('move-accepted', (data: any) => {
        setBoard(prev => {
          const newBoard = prev.map(row => [...row]);
          newBoard[data.row][data.col] = data.stone as Stone;
          return newBoard;
        });
        setTurn(data.turn);
        setLastMove({ row: data.row, col: data.col });
      });

      // game-ended
      socket.on('game-ended', (data: any) => {
        setGameState(prev => prev ? { ...prev, winner: { id: data.winnerId, nickname: data.winnerNickname }, status: 'FINISHED' } : null);
        setGameStarted(false);
      });

      // game-restarted
      socket.on('game-restarted', (data: any) => {
        setBoard(data.boardState.stones as Stone[][]);
        setTurn(data.turn);
        setLastMove(null);
        setGameState(prev => prev ? { ...prev, boardState: data.boardState, status: 'ACTIVE', winner: null } : null);
        setGameStarted(true);
      });

      // player-joined / player-left
      socket.on('player-joined', (data: any) => {
        setPlayers(prev => {
          if (prev.find(p => p.userId === data.userId)) return prev;
          return [...prev, { id: data.userId, nickname: data.nickname, role: data.role }];
        });
      });

      socket.on('player-left', (data: any) => {
        setPlayers(prev => prev.filter(p => p.userId !== data.userId));
      });

      // chat
      socket.on('chat-receive', (msg: ChatMessage) => {
        setChatMessages(prev => [...prev, msg]);
      });

      // Load initial chat
      try {
        const chats = await getChat(roomId);
        setChatMessages(chats);
      } catch {
        // Ignore
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '방 초기화 실패');
      setLoading(false);
    }
  };

  const cleanup = () => {
    const socket = getSocket();
    socket.off('room-joined');
    socket.off('move-accepted');
    socket.off('game-ended');
    socket.off('game-restarted');
    socket.off('player-joined');
    socket.off('player-left');
    socket.off('chat-receive');

    if (roomId) {
      leaveRoom(roomId).catch(() => {});
      socket.emit('leave-room', { roomId });
    }
  };

  const handleCellClick = useCallback((row: number, col: number) => {
    if (isSpectator || !gameStarted || !isMyTurn) return;

    const socket = getSocket();
    socket.emit('game-move', { roomId, row, col }, (ack: any) => {
      if (ack.error) {
        alert(ack.message || '잘못된 수입니다');
      }
    });
  }, [roomId, isSpectator, gameStarted, isMyTurn]);

  const handleRestart = useCallback(() => {
    const socket = getSocket();
    socket.emit('game-restart', { roomId }, (ack: any) => {
      if (ack.error) {
        alert(ack.message || '재시작 실패');
      }
    });
  }, [roomId]);

  const handleLeave = () => {
    cleanup();
    navigate('/');
  };

  if (!roomId || !user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">로그인하세요</div>;
  }

  return (
    <div className="min-h-screen p-2 sm:p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex items-center justify-between mb-3">
        <button onClick={handleLeave} className="text-gray-400 hover:text-gray-200 text-sm transition-colors">
          ← 방 나가기
        </button>
        <span className="text-sm text-gray-500">{roomId}</span>
      </div>

      {loading ? (
        <div className="min-h-[60vh] flex items-center justify-center text-gray-500">로딩 중...</div>
      ) : error ? (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-red-400">
          <div className="text-3xl mb-3">😵</div>
          <div>{error}</div>
          <button onClick={handleLeave} className="mt-4 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors">
            돌아가기
          </button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4">
          {/* Left: Board */}
          <div className="flex-1 flex justify-center">
            <Board
              board={board}
              onCellClick={handleCellClick}
              lastMove={lastMove}
              disabled={isSpectator || !gameStarted || !isMyTurn}
              isMyTurn={isMyTurn && !isSpectator}
            />
          </div>

          {/* Right: Status + Chat */}
          <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-4">
            <GameStatus
              gameState={gameState}
              myPlayer={players.find(p => p.id === user.id) || null}
              players={players}
              onRestart={handleRestart}
            />
            <div className="flex-1 min-h-[200px] max-h-[60vh] lg:max-h-none">
              <ChatBox
                roomId={roomId}
                myUserId={user.id}
                myNickname={user.nickname}
                initialMessages={chatMessages}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
