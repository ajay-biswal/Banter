'use client';

import { useState } from 'react';
import { useChat } from '@/hooks';
import { useAuth } from '@/hooks';
import ConversationItem from './ConversationItem';
import NewChatButton from './NewChatButton';
import UserPicker from './UserPicker';
import Image from 'next/image';

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
      {/* Logo Header */}
      <div className="px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Image
            src="/banter.png"
            alt="Banter"
            width={32}
            height={32}
            className="object-contain"
          />
          <span className="text-lg font-semibold text-white hidden md:block">
            Banter
          </span>
        </div>
      </div>

      {/* User Profile Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3 mb-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
          </div>
          
          {/* User info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate">{user?.name || 'User'}</h3>
            <p className="text-xs text-emerald-400">Online</p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full h-9 pl-9 pr-3 bg-slate-950 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      {/* New Chat Button */}
      <div className="px-3 py-2">
        <NewChatButton onClick={() => setIsUserPickerOpen(true)} />
      </div>
      
      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2">
        {conversations.length > 0 ? (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <div 
                key={conversation._id}
                onClick={() => handleConversationClick(conversation._id)}
                className={`rounded-xl transition-all duration-200 ${
                  activeConversationId === conversation._id 
                    ? 'bg-purple-500/10 border border-purple-500/20' 
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <ConversationItem 
                  conversation={conversation} 
                  isActive={activeConversationId === conversation._id}
                  currentUserId={user?._id || ''}
                  userPresence={userPresence}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm text-gray-400">No conversations yet</p>
            <p className="text-xs text-gray-500 mt-1">Start a new chat to begin</p>
          </div>
        )}
      </div>
      
      {/* Logout Button */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={logout}
          className="w-full py-2.5 px-4 flex items-center justify-center gap-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          aria-label="Logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
      
      {/* User Picker Modal */}
      <UserPicker 
        isOpen={isUserPickerOpen} 
        onClose={() => setIsUserPickerOpen(false)} 
      />
    </div>
  );
}