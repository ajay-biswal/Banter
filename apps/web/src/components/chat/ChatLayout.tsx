'use client';

import { useEffect, useState } from 'react';
import { socket } from '@/socket/socket.client';
import { useChatStore, useAuthStore } from '@/store';
import { Message } from '@/types';
import { useChat, useAuth } from '@/hooks';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import UserInfoPanel from './UserInfoPanel';

export default function ChatLayout() {
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [mobileShowProfile, setMobileShowProfile] = useState(false);
  const { conversations, activeConversationId } = useChat();
  const { user } = useAuth();

  // Get the selected user from active conversation
  const activeConversation = conversations.find(
    conversation => conversation._id === activeConversationId
  );
  
  const selectedUser = activeConversation?.participants.find(
    participant => participant._id !== user?._id
  );

  // Auto-open panel when user selects a chat
  useEffect(() => {
    if (activeConversationId && selectedUser) {
      setShowInfoPanel(true);
    }
  }, [activeConversationId, selectedUser]);

  // Auto-close panel when user deselects chat
  useEffect(() => {
    if (!activeConversationId) {
      setShowInfoPanel(false);
    }
  }, [activeConversationId]);
  useEffect(() => {
    const joinActiveConversation = () => {
      const { activeConversationId } = useChatStore.getState();

      if (activeConversationId) {
        socket.emit('conversation:join', activeConversationId);
        socket.emit('join:conversation', activeConversationId);
      }
    };

    socket.connect();
    socket.on('connect', joinActiveConversation);

    if (socket.connected) {
      joinActiveConversation();
    }

    return () => {
      socket.off('connect', joinActiveConversation);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      useChatStore.getState().reconcileMessage(message);
    };
    const handlePresenceUpdate = (data: { userId: string; status: 'online' | 'offline' }) => {
      useChatStore.getState().updateUserPresence(data.userId, data.status === 'online');
    };
    const handleUserOnline = (userId: string) => {
      useChatStore.getState().setUserOnline(userId);
    };
    const handleUserOffline = (userId: string) => {
      useChatStore.getState().setUserOffline(userId);
    };
    const handleTypingStatus = (data: { conversationId: string; userId: string; typing: boolean }) => {
      const store = useChatStore.getState();
      if (data.typing) {
        store.addUserTyping(data.conversationId, data.userId);
      } else {
        store.removeUserTyping(data.conversationId, data.userId);
      }
    };
    const handleTypingStart = (data: { conversationId: string; userId: string } | string) => {
      const activeConversationId = useChatStore.getState().activeConversationId;
      const conversationId = typeof data === 'string' ? activeConversationId : data.conversationId;
      const userId = typeof data === 'string' ? data : data.userId;

      if (conversationId && userId) {
        useChatStore.getState().addUserTyping(conversationId, userId);
      }
    };
    const handleTypingStop = (data: { conversationId: string; userId: string } | string) => {
      const activeConversationId = useChatStore.getState().activeConversationId;
      const conversationId = typeof data === 'string' ? activeConversationId : data.conversationId;
      const userId = typeof data === 'string' ? data : data.userId;

      if (conversationId && userId) {
        useChatStore.getState().removeUserTyping(conversationId, userId);
      }
    };
    const handleMessageStatus = (data: { messageIds?: string[]; status: 'delivered' | 'read' | 'read-all'; conversationId?: string }) => {
      // Handle 'read-all' status - mark all messages in conversation as read
      if (data.status === 'read-all' && data.conversationId) {
        const currentUserId = useAuthStore.getState().user?._id;
        if (currentUserId) {
          useChatStore.getState().markConversationMessagesAsRead(data.conversationId, currentUserId);
        }
        return;
      }

      // Handle individual message status updates
      if (!data.messageIds) return;

      const status = data.status;
      // Only update if status is 'delivered' or 'read' (not 'read-all')
      if (status === 'delivered' || status === 'read') {
        data.messageIds.forEach((messageId) => {
          useChatStore.getState().updateMessageStatus(messageId, status);
        });
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('presence:update', handlePresenceUpdate);
    socket.on('user:online', handleUserOnline);
    socket.on('user:offline', handleUserOffline);
    socket.on('typing:status', handleTypingStatus);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);
    socket.on('message:status', handleMessageStatus);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('presence:update', handlePresenceUpdate);
      socket.off('user:online', handleUserOnline);
      socket.off('user:offline', handleUserOffline);
      socket.off('typing:status', handleTypingStatus);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
      socket.off('message:status', handleMessageStatus);
    };
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950">
      {/* Left Sidebar - Mobile: Full screen when no chat, Tablet/Desktop: Always visible */}
      <div className={`
        w-full md:w-80 lg:w-80
        border-r border-white/10
        bg-[#020617]
        flex flex-col
        flex-shrink-0
        ${activeConversationId ? 'hidden md:flex' : 'flex'}
        transition-all duration-200
      `}>
        <Sidebar />
      </div>
      
      {/* Center Chat Area - Mobile: Full screen when chat selected, Tablet/Desktop: Flex */}
      <div className={`
        flex-1 flex flex-col
        min-w-0
        ${!activeConversationId ? 'hidden md:flex' : 'flex'}
      `}>
        <ChatWindow 
          showInfoPanel={showInfoPanel}
          onToggleInfo={() => setShowInfoPanel(!showInfoPanel)}
          onShowProfile={() => setMobileShowProfile(true)}
        />
      </div>

      {/* Right User Info Panel - Desktop only */}
      {activeConversationId && selectedUser && showInfoPanel && (
        <div className="hidden lg:flex w-80 border-l border-white/10 bg-[#020617] flex-shrink-0">
          <UserInfoPanel 
            user={selectedUser}
            onClose={() => setShowInfoPanel(false)}
          />
        </div>
      )}

      {/* Mobile Profile Drawer - Overlay */}
      {mobileShowProfile && activeConversationId && selectedUser && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setMobileShowProfile(false)}
        >
          <div 
            className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-[#020617] shadow-lg overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <UserInfoPanel 
              user={selectedUser}
              onClose={() => setMobileShowProfile(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
