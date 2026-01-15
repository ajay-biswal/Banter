'use client';

import { useState } from 'react';
import { useChat } from '@/hooks';
import { useAuth } from '@/hooks';
import ConversationItem from './ConversationItem';

export default function Sidebar() {
  const { conversations, activeConversationId, setActiveConversation, setMessages } = useChat();
  const { getMessages } = useChat();
  const { user } = useAuth();

  const handleConversationClick = async (conversationId: string) => {
    setActiveConversation(conversationId);
    
    try {
      const messages = await getMessages(conversationId);
      setMessages(conversationId, messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Chats</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length > 0 ? (
          conversations.map((conversation) => (
            <div 
              key={conversation._id} 
              onClick={() => handleConversationClick(conversation._id)}
              className={`cursor-pointer ${activeConversationId === conversation._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
            >
              <ConversationItem 
                conversation={conversation} 
                isActive={activeConversationId === conversation._id}
                currentUserId={user?._id || ''}
              />
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">No conversations yet</div>
        )}
      </div>
    </div>
  );
}