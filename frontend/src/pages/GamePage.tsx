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

  // Use refs to capture latest values in socket callbacks (avoids stale closures)
  const userRef = useRef(user);
  const roomIdRef = useRef(roomId);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { roomIdRef.current = roomId; }, [roomId]);

  const isBlack = myRole === 'PLAYER_BLACK';
  const isMyTurn = turn === (isBlack ? 0 : 1);
  const isSpectator = myRole === 'SPECTATOR';

  // All socket event handlers defined once with refs for latest state
  const handlersRef = useRef<Record<string, (...args: any[]) => void>>({});

  const setupSocketHandlers = useCallback((socket: any) => {
    // room-joined: get full state
    const onRoomJoined = (data: any) => {
      setPlayers(data.players || []);
      setGameState(data.game);
      if (data.game?.boardState) {
        setBoard(data.game.boardState.stones as Stone[][]);
        setTurn(data.game.turn);
        setGameStarted(true);
      }
      setChatMessages(data.recentChats || []);

      // Find my role
      const currentUser = userRef.current;
      if (currentUser) {
        const myPlayer = [...(data.players || []), ...(data.spectators || [])]
          .find((p: any) => p.userId === currentUser.id);
        if (myPlayer) {
          setMyRole(myPlayer.role);
        }
      }
      setLoading(false);
    };

    // move-accepted
    const onMoveAccepted = (data: any) => {
      setBoard(prev => {
        const newBoard = prev.map(row => [...row]);
        newBoard[data.row][data.col] = data.stone as Stone;
        return newBoard;
      });
      setTurn(data.turn);
      setLastMove({ row: data.row, col: data.col });
    };

    // game-ended
    const onGameEnded = (data: any) => {
      setGameState(prev => prev ? { ...prev, winner: { id: data.winnerId, nickname: data.winnerNickname }, status: 'FINISHED' } : null);
      setGameStarted(false);
    };

    // game-restarted
    const onGameRestarted = (data: any) => {
      setBoard(data.boardState.stones as Stone[][]);
      setTurn(data.turn);
      setLastMove(null);
      setGameState(prev => prev ? { ...prev, boardState: data.boardState, status: 'ACTIVE', winner: null } : null);
      setGameStarted(true);
    };

    // player-joined / player-left
    const onPlayerJoined = (data: any) => {
      setPlayers(prev => {
        if (prev.find(p => p.userId === data.userId)) return prev;
        return [...prev, { id: data.userId, nickname: data.nickname, role: data.role }];
      });
    };

    const onPlayerLeft = (data: any) => {
      setPlayers(prev => prev.filter(p => p.userId !== data.userId));
    };

    // chat
    const onChatReceive = (msg: ChatMessage) => {
      setChatMessages(prev => [...prev, msg]);
    };

    // Store handler references
    handlersRef.current = {
      'room-joined': onRoomJoined,
      'move-accepted': onMoveAccepted,
      'game-ended': onGameEnded,
      'game-restarted': onGameRestarted,
      'player-joined': onPlayerJoined,
      'player-left': onPlayerLeft,
      'chat-receive': onChatReceive,
    };

    // Register listeners
    socket.on('room-joined', onRoomJoined);
    socket.on('move-accepted', onMoveAccepted);
    socket.on('game-ended', onGameEnded);
    socket.on('game-restarted', onGameRestarted);
    socket.on('player-joined', onPlayerJoined);
    socket.on('player-left', onPlayerLeft);
    socket.on('chat-receive', onChatReceive);
  }, []);

  const removeSocketHandlers = useCallback((socket: any) => {
    Object.values(handlersRef.current).forEach((fn: any) => socket.off(fn));
    handlersRef.current = {};
  }, []);

  // Room initialization
  useEffect(() => {
    if (!roomId || !user) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const socket = getSocket();

    // Wait for socket connection before sending join
    const connectTimeout = setTimeout(() => {
      if (socket.connected) {
        doJoin(socket);
      } else {
        // Socket not connected yet, wait for 'connect' event
        const onConnect = () => {
          socket.off('connect', onConnect);
          if (!cancelled) doJoin(socket);
        };
        socket.on('connect', onConnect);
        // Also listen for connect_error
        const onError = (err: any) => {
          console.error('[GamePage] Socket connect error:', err);
          if (!cancelled) {
            setError('서버 연결 실패. 다시 시도해주세요.');
            setLoading(false);
          }
        };
        socket.on('connect_error', onError);
        // Cleanup on unmount
        return () => {
          cancelled = true;
          socket.off('connect', onConnect);
          socket.off('connect_error', onError);
        };
      }
    }, 50);

    const doJoin = (sock: any) => {
      // First try REST join for initial data
      (async () => {
        try {
          await joinRoom(roomIdRef.current!);
        } catch {
          // Might already be in room, continue
        }

        // Setup event handlers (once per session)
        setupSocketHandlers(sock);

        // Emit join-room
        sock.emit('join-room', { roomId: roomIdRef.current! }, (ack: any) => {
          if (ack?.error && !cancelled) {
            setError(ack.message || '방 참가 실패');
            setLoading(false);
          }
        });

        // Load initial chat
        try {
          const chats = await getChat(roomIdRef.current!);
          setChatMessages(chats);
        } catch {
          // Ignore
        }
      })();
    };

    // Timeout: if no room-joined within 10s, show error
    const initTimeout = setTimeout(() => {
      if (loading && !cancelled) {
        setError('방 로딩 시간 초과. 방이 존재하는지 확인해주세요.');
        setLoading(false);
      }
    }, 10000);

    return () => {
      cancelled = true;
      clearTimeout(connectTimeout);
      clearTimeout(initTimeout);
      removeSocketHandlers(socket);
      // Leave room on cleanup
      (async () => {
        try { await leaveRoom(roomIdRef.current!); } catch {};
        socket.emit('leave-room', { roomId: roomIdRef.current! });
      })();
    };
  }, [roomId, user, setupSocketHandlers, removeSocketHandlers]);

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
    const socket = getSocket();
    removeSocketHandlers(socket);
    if (roomId) {
      leaveRoom(roomId).catch(() => {});
      socket.emit('leave-room', { roomId });
    }
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
