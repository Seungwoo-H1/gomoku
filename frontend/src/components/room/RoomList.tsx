// RoomList component

import type { Room } from '../../types/api';
import RoomCard from './RoomCard';

interface RoomListProps {
  rooms: Room[];
  loading: boolean;
  onJoin: (roomId: string) => void;
  onRefresh: () => void;
}

export default function RoomList({ rooms, loading, onJoin, onRefresh }: RoomListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-200">🏠 방 목록</h2>
        <button onClick={onRefresh} className="text-gray-400 hover:text-gray-200 text-sm transition-colors">
          🔄 새로고침
        </button>
      </div>
      {loading ? (
        <div className="text-center text-gray-500 py-8">로딩 중...</div>
      ) : rooms.length === 0 ? (
        <div className="text-center text-gray-600 py-8">
          <div className="text-3xl mb-2">🎯</div>
          <div>아직 방이 없습니다</div>
          <div className="text-sm text-gray-700 mt-1">첫 번째 방을 만들어보세요!</div>
        </div>
      ) : (
        <div className="space-y-2">
          {rooms.map(room => (
            <RoomCard key={room.id} room={room} onJoin={onJoin} />
          ))}
        </div>
      )}
    </div>
  );
}
