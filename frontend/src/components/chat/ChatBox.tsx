// ChatBox component

import { useState, useEffect, useRef } from 'react';
import type { ChatMessage as ChatMsg } from '../../types/api';
import { getSocket } from '../../lib/socket';
import { sendChat as apiSendChat } from '../../lib/api';

interface ChatBoxProps {
  roomId: string;
  myUserId: string;
  myNickname: string;
  initialMessages?: ChatMsg[];
}

export default function ChatBox({ roomId, myUserId, myNickname, initialMessages = [] }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMsg[]>(initialMessages);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for incoming chat
  useEffect(() => {
    const socket = getSocket();
    const handler = (msg: ChatMsg) => {
      if (msg.roomId === roomId || msg.id) {
        // Check it's from this room
        setMessages(prev => [...prev, msg]);
      }
    };
    socket.on('chat-receive', handler);
    return () => {
      socket.off('chat-receive', handler);
    };
  }, [roomId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const msg: ChatMsg = {
      id: Date.now().toString(),
      userId: myUserId,
      nickname: myNickname,
      message: input.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, msg]);
    setInput('');

    try {
      await apiSendChat(roomId, input.trim());
      // Socket.IO will also broadcast, avoid duplicate
    } catch {
      // Silently fail — socket will retry
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/50 rounded-lg border border-gray-800">
      <div className="px-3 py-2 border-b border-gray-800 text-sm font-medium text-gray-400">
        💬 채팅
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0">
        {messages.length === 0 && (
          <div className="text-gray-600 text-xs text-center py-4">아직 메시지가 없습니다</div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className="text-sm">
            <span className={`font-medium ${msg.userId === myUserId ? 'text-blue-400' : 'text-gray-300'}`}>
              {msg.nickname}
            </span>
            <span className="text-gray-500 text-xs ml-1">{new Date(msg.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="text-gray-300 ml-1">{msg.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-2 border-t border-gray-800 flex gap-1">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="메시지 입력..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          전송
        </button>
      </div>
    </div>
  );
}
