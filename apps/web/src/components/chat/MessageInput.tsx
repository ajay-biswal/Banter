'use client';

import { useState, useEffect } from 'react';
import { useChat, useSocket } from '@/hooks';

export default function MessageInput() {
  const { activeConversationId, sendMessage } = useChat();
  const { socket } = useSocket();
  const [inputValue, setInputValue] = useState('');
  
  // Track typing state with debounce
  useEffect(() => {
    if (!activeConversationId || !socket) return;
    
    if (inputValue.trim()) {
      // Emit typing:start when user starts typing
      socket.emit('typing:start', { conversationId: activeConversationId });
      
      // Clear any existing timeout
      const timeoutId = setTimeout(() => {
        // Emit typing:stop after user stops typing for 1.5 seconds
        socket.emit('typing:stop', { conversationId: activeConversationId });
      }, 1500);
      
      // Cleanup function to clear timeout
      return () => clearTimeout(timeoutId);
    } else {
      // If input is empty, emit typing:stop
      socket.emit('typing:stop', { conversationId: activeConversationId });
    }
  }, [inputValue, activeConversationId, socket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !activeConversationId) return;
    
    try {
      await sendMessage(activeConversationId, inputValue.trim());
      setInputValue(''); // Clear input after sending
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="bg-white p-4 border-t border-gray-200">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!activeConversationId}
            placeholder={activeConversationId ? 'Type a message...' : 'Select a conversation first'}
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!activeConversationId || !inputValue.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}