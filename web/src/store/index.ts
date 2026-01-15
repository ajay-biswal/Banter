// Store will be implemented in subsequent phases

import { create } from 'zustand';
import { authService } from '@/services/http';
import { User } from '@/types';
import { socket } from '@/socket/socket.client';
import { Conversation, Message } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  fetchMe: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  fetchMe: async () => {
    try {
      set({ loading: true });
      const response = await authService.fetchMe();
      set({ 
        user: response.user, 
        isAuthenticated: true, 
        loading: false 
      });
    } catch (error) {
      set({ 
        user: null, 
        isAuthenticated: false, 
        loading: false 
      });
    } finally {
      // Defensive: ensure loading is always false when fetchMe completes
      set({ loading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      await authService.login({ email, password });
      await get().fetchMe();
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Even if logout fails, clear local state
    } finally {
      set({ 
        user: null, 
        isAuthenticated: false, 
        loading: false 
      });
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      await authService.register({ name, email, password });
      await get().fetchMe();
    } catch (error) {
      throw error;
    }
  }
}));

// Socket Store
interface SocketState {
  socket: typeof socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,

  connect: () => {
    const { socket: currentSocket, isConnected } = get();
    
    // Connect socket ONLY if not already connected
    if (!isConnected && currentSocket) {
      currentSocket.connect();
    }
  },

  disconnect: () => {
    const { socket: currentSocket, isConnected } = get();
    
    // Disconnect socket if connected
    if (isConnected && currentSocket) {
      currentSocket.disconnect();
      set({ isConnected: false });
    }
  }
}));

// Initialize socket and set up event listeners
socket.on('connect', () => {
  console.log('Socket connected');
  useSocketStore.getState().socket = socket;
  useSocketStore.getState().isConnected = true;
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
  useSocketStore.getState().isConnected = false;
});

// Socket event listeners for chat updates
socket.on('message:new', (message: Message) => {
  // Call chatStore.addMessage(message) to update the store
  try {
    useChatStore.getState().reconcileMessage(message);
  } catch (error) {
    console.error('Error adding message from socket:', error);
  }
});

// Chat Store
interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messagesByConversationId: Record<string, Message[]>;
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (conversationId: string | null) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;
  sendMessage: (conversationId: string, content: string) => void;
  reconcileMessage: (serverMessage: Message) => void;
  markMessageFailed: (clientMessageId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messagesByConversationId: {},

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),

  setMessages: (conversationId, messages) => {
    const { messagesByConversationId } = get();
    set({ 
      messagesByConversationId: { 
        ...messagesByConversationId, 
        [conversationId]: messages 
      } 
    });
  },

  addMessage: (message) => {
    const { conversations, messagesByConversationId, activeConversationId } = get();
    
    // Check if message already exists
    const existingMessages = messagesByConversationId[message.conversationId] || [];
    const messageExists = existingMessages.some(msg => msg._id === message._id);
    
    if (messageExists) {
      return; // Don't add duplicate
    }

    // Update messages for the conversation
    const updatedMessages = [...existingMessages, message];
    const updatedMessagesByConversationId = {
      ...messagesByConversationId,
      [message.conversationId]: updatedMessages
    };

    // Update conversations to reflect the new lastMessage
    const updatedConversations = conversations.map(conv => {
      if (conv._id === message.conversationId) {
        return {
          ...conv,
          lastMessage: message,
          updatedAt: message.createdAt
        };
      }
      return conv;
    });

    set({
      conversations: updatedConversations,
      messagesByConversationId: updatedMessagesByConversationId
    });
  },

  sendMessage: (conversationId, content) => {
    const { socket } = useSocketStore.getState();
    const { messagesByConversationId } = get();
    
    // Generate clientMessageId
    const clientMessageId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create optimistic message
    const optimisticMessage: Message = {
      _id: clientMessageId,
      conversationId,
      senderId: '', // Will be filled by server
      content,
      type: 'text',
      status: 'sending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clientMessageId
    };

    // Insert optimistic message into messagesByConversationId
    const existingMessages = messagesByConversationId[conversationId] || [];
    const updatedMessages = [...existingMessages, optimisticMessage];
    const updatedMessagesByConversationId = {
      ...messagesByConversationId,
      [conversationId]: updatedMessages
    };

    set({
      messagesByConversationId: updatedMessagesByConversationId
    });

    // Call socket.emit("message:send")
    if (socket) {
      socket.emit('message:send', {
        conversationId,
        content,
        clientMessageId
      });
    } else {
      // If socket is not connected, mark message as failed
      get().markMessageFailed(clientMessageId);
    }
  },

  reconcileMessage: (serverMessage) => {
    const { messagesByConversationId, conversations } = get();
    
    // If serverMessage has clientMessageId, find and replace optimistic message
    if (serverMessage.clientMessageId) {
      // Find the conversation's messages
      const conversationMessages = messagesByConversationId[serverMessage.conversationId] || [];
      
      // Find the optimistic message with matching clientMessageId
      const optimisticIndex = conversationMessages.findIndex(
        msg => msg.clientMessageId === serverMessage.clientMessageId
      );
      
      if (optimisticIndex !== -1) {
        // Replace the optimistic message with the server message
        const updatedConversationMessages = [...conversationMessages];
        updatedConversationMessages[optimisticIndex] = serverMessage;
        
        // Update the messagesByConversationId
        const updatedMessagesByConversationId = {
          ...messagesByConversationId,
          [serverMessage.conversationId]: updatedConversationMessages as Message[]
        };

        // Update conversations to reflect the new lastMessage
        const updatedConversations = conversations.map(conv => {
          if (conv._id === serverMessage.conversationId) {
            return {
              ...conv,
              lastMessage: serverMessage,
              updatedAt: serverMessage.createdAt
            };
          }
          return conv;
        });

        set({
          conversations: updatedConversations,
          messagesByConversationId: updatedMessagesByConversationId
        });
      } else {
        // If no matching optimistic message, add as a new message
        get().addMessage(serverMessage);
      }
    } else {
      // If no clientMessageId, add as a new message
      get().addMessage(serverMessage);
    }
  },

  markMessageFailed: (clientMessageId) => {
    const { messagesByConversationId } = get();
    
    // Find the message with the given clientMessageId
    let messageToUpdate: Message | null = null;
    let conversationIdToUpdate: string | null = null;
    
    for (const [conversationId, messages] of Object.entries(messagesByConversationId)) {
      const messageIndex = messages.findIndex(msg => msg.clientMessageId === clientMessageId);
      if (messageIndex !== -1) {
        messageToUpdate = messages[messageIndex];
        conversationIdToUpdate = conversationId;
        break;
      }
    }
    
    if (messageToUpdate && conversationIdToUpdate) {
      // Update the message status to 'failed'
      const conversationMessages = messagesByConversationId[conversationIdToUpdate] || [];
      const updatedConversationMessages = conversationMessages.map(msg => 
        msg.clientMessageId === clientMessageId 
          ? { ...msg, status: 'failed' } as Message
          : msg
      );
      
      const updatedMessagesByConversationId = {
        ...messagesByConversationId,
        [conversationIdToUpdate]: updatedConversationMessages
      };
      
      set({
        messagesByConversationId: updatedMessagesByConversationId
      });
    }
  }
}));