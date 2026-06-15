// RoomCard component

import type { Room } from '../../types/api';

interface RoomCardProps {
  room: Room;
  onJoin: (roomId: string) => void;
}

export default function RoomCard({ room, onJoin }: RoomCardProps) {
  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-3 hover:border-gray-700 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-200">{room.roomName}</div>
          <div className="text-xs text-gray-500 mt-1">
            👥 {room.playerCount}/{room.maxPlayers} · {room.status === 'LOBBY' ? '대기중' : room.status === 'PLAYING' ? '진행중' : '종료'}
          </div>
        </div>
        {room.status === 'LOBBY' && (
          <button
            onClick={() => onJoin(room.id)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
          >
            입장
          </button>
        )}
      </div>
    </div>
  );
}
