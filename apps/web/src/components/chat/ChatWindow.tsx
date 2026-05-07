'use client';

import { useEffect } from 'react';
import { useChat, useAuth } from '@/hooks';
import { socket } from '@/socket/socket.client';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatWindowProps {
  showInfoPanel: boolean;
  onToggleInfo: () => void;
  onShowProfile?: () => void;
}

export default function ChatWindow({ showInfoPanel, onToggleInfo, onShowProfile }: ChatWindowProps) {
  const { activeConversationId } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    if (!activeConversationId) return;

    // Join conversation room
    socket.emit('conversation:join', activeConversationId);
    socket.emit('join:conversation', activeConversationId);

    // Emit message:read to mark all messages as read when opening conversation
    if (user?._id) {
      socket.emit('message:read', {
        conversationId: activeConversationId,
        userId: user._id
      });
    }

    return () => {
      socket.emit('conversation:leave', activeConversationId);
    };
  }, [activeConversationId, user?._id]);

  if (!activeConversationId) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-900 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-300 mb-2">Welcome to Banter</h2>
          <p className="text-gray-500">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <ChatHeader 
        showInfo={showInfoPanel}
        onToggleInfo={onToggleInfo}
        onShowProfile={onShowProfile}
      />
      <MessageList />
      <MessageInput />
    </div>
  );
}
