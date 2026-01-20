'use client';

import { useState } from 'react';
import { useChat } from '@/hooks';
import { useAuth } from '@/hooks';
import ConversationItem from './ConversationItem';
import NewChatButton from './NewChatButton';
import UserPicker from './UserPicker';

export default function Sidebar() {
  const { conversations, activeConversationId, setActiveConversation, setMessages, userPresence } = useChat();
  const { getMessages } = useChat();
  const { user, logout } = useAuth();
  
  const [isUserPickerOpen, setIsUserPickerOpen] = useState(false);

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
      
      <NewChatButton onClick={() => setIsUserPickerOpen(true)} />
      
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
                userPresence={userPresence}
              />
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">No conversations yet</div>
        )}
      </div>
      
      <div className="mt-auto p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full py-2 px-4 flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
      
      <UserPicker 
        isOpen={isUserPickerOpen} 
        onClose={() => setIsUserPickerOpen(false)} 
      />
    </div>
  );
}