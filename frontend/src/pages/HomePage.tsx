// HomePage — Nickname login + Room list

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRooms, createRoom } from '../lib/api';
import { getSocket } from '../lib/socket';
import { useNavigate } from 'react-router-dom';
import RoomList from '../components/room/RoomList';
import RoomCreateModal from '../components/room/RoomCreateModal';

export default function HomePage() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRooms();
    }
  }, [isAuthenticated, user]);

  // Refresh rooms every 10s
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await getRooms();
      setRooms(data);
    } catch {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      login(nickname.trim());
    }
  };

  const handleCreateRoom = async (name: string, maxPlayers: number) => {
    try {
      const room = await createRoom(name, maxPlayers);
      // Navigate directly to game room
      navigate(`/game/${room.id}`);
    } catch (err: any) {
      alert(err.response?.data?.error || '방 생성 실패');
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      navigate(`/game/${roomId}`);
    } catch (err: any) {
      alert(err.response?.data?.error || '방 참가 실패');
    }
  };

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🎯</div>
            <h1 className="text-2xl font-bold text-gray-100">오목 (Gomoku)</h1>
            <p className="text-gray-500 text-sm mt-1">실시간 온라인 멀티플레이</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="닉네임 입력"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 text-center text-lg focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={!nickname.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white py-3 rounded-lg font-bold text-lg transition-colors"
            >
              시작하기
            </button>
          </form>
          <div className="mt-4 text-center text-xs text-gray-600">
            철수 · 영희 · 홍길동
          </div>
        </div>
      </div>
    );
  }

  // Logged in
  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎯</span>
          <h1 className="text-xl font-bold text-gray-100">오목</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            👤 {user?.nickname}
          </span>
          <button
            onClick={() => { logout(); }}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            logout
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="max-w-2xl mx-auto flex gap-2 mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
        >
          + 방 생성
        </button>
      </div>

      {/* Room List */}
      <div className="max-w-2xl mx-auto">
        <RoomList rooms={rooms} loading={loading} onJoin={handleJoinRoom} onRefresh={fetchRooms} />
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <RoomCreateModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateRoom} />
      )}
    </div>
  );
}
