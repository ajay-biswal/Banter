// Hooks will be added in subsequent phases

import { useAuthStore, useSocketStore, useChatStore } from '@/store';
import { chatService } from '@/services/chat.service';

export const useAuth = () => {
  const { user, isAuthenticated, loading, fetchMe, login, logout, register } = useAuthStore();
  
  return {
    user,
    isAuthenticated,
    loading,
    fetchMe,
    login,
    logout,
    register
  };
};

export const useSocket = () => {
  const { socket, isConnected, connect, disconnect } = useSocketStore();
  
  return {
    socket,
    isConnected,
    connect,
    disconnect
  };
};

export const useChat = () => {
  const { 
    conversations, 
    activeConversationId, 
    messagesByConversationId, 
    userPresence,
    typingUsersByConversation,
    setConversations, 
    setActiveConversation, 
    setMessages, 
    addMessage, 
    sendMessage, 
    reconcileMessage, 
    markMessageFailed,
    upsertConversation
  } = useChatStore();
  
  // Add a retry function that uses the existing sendMessage function
  const retryMessage = async (clientMessageId: string) => {
    // Find the failed message to get its content and conversation
    for (const [conversationId, messages] of Object.entries(messagesByConversationId)) {
      const failedMessage = messages.find(msg => 
        msg.clientMessageId === clientMessageId && msg.status === 'failed'
      );
      
      if (failedMessage) {
        // Attempt to send the message again
        await sendMessage(conversationId, failedMessage.content);
        break;
      }
    }
  };
  
  return {
    conversations,
    activeConversationId,
    messagesByConversationId,
    userPresence,
    typingUsersByConversation,
    setConversations,
    setActiveConversation,
    setMessages,
    addMessage,
    sendMessage,
    reconcileMessage,
    markMessageFailed,
    upsertConversation,
    retryMessage,
    getConversations: chatService.getConversations,
    getMessages: chatService.getMessages
  };
};