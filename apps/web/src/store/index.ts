// Store will be implemented in subsequent phases

import { create } from 'zustand';
import { authService } from '@/services/http';
import { User } from '@/types';
import { socket } from '@/socket/socket.client';
import { Conversation, Message } from '@/types';

type MessageAck = {
  success: boolean;
  message?: Message | string;
  data?: Message;
  error?: string;
};

const makeClientId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getMessageClientId = (message: Message) => message.clientId || message.clientMessageId;

const normalizeMessage = (message: Message): Message => {
  const clientId = getMessageClientId(message);

  return clientId
    ? { ...message, clientId, clientMessageId: clientId }
    : message;
};

const isSameMessage = (left: Message, right: Message) => {
  const leftClientId = getMessageClientId(left);
  const rightClientId = getMessageClientId(right);

  return (
    left._id === right._id ||
    Boolean(leftClientId && rightClientId && leftClientId === rightClientId)
  );
};

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
    } catch {
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
    } catch {
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
  socket,
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
  useSocketStore.setState({ socket, isConnected: true });
});

socket.on('disconnect', () => {
  useSocketStore.setState({ isConnected: false });
});

// Chat Store
interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messagesByConversationId: Record<string, Message[]>;
  userPresence: Record<string, boolean>;
  typingUsersByConversation: Record<string, string[]>;
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (conversationId: string | null) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  confirmMessage: (clientId: string, serverMessage: Message) => void;
  reconcileMessage: (serverMessage: Message) => void;
  markFailed: (clientId: string) => void;
  markMessageFailed: (clientId: string) => void;
  updateConversationLastMessage: (message: Message) => void;
  updateUserPresence: (userId: string, isOnline: boolean) => void;
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
  addUserTyping: (conversationId: string, userId: string) => void;
  removeUserTyping: (conversationId: string, userId: string) => void;
  updateMessageStatus: (messageId: string, status: 'delivered' | 'read') => void;
  markConversationMessagesAsRead: (conversationId: string, currentUserId: string) => void;
  upsertConversation: (conversation: Conversation) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messagesByConversationId: {},
  userPresence: {},
  typingUsersByConversation: {},

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),

  setMessages: (conversationId, messages) => set((state) => ({
    messagesByConversationId: {
      ...state.messagesByConversationId,
      [conversationId]: messages.map(normalizeMessage)
    }
  })),

  addMessage: (message) => set((state) => {
    const nextMessage = normalizeMessage(message);
    const existingMessages = state.messagesByConversationId[message.conversationId] || [];
    const existingIndex = existingMessages.findIndex((msg) => isSameMessage(msg, nextMessage));
    const messages = existingIndex >= 0
      ? existingMessages.map((msg, index) => index === existingIndex ? nextMessage : msg)
      : [...existingMessages, nextMessage];

    return {
      conversations: state.conversations.map((conv) => (
        conv._id === nextMessage.conversationId
          ? { ...conv, lastMessage: nextMessage, updatedAt: nextMessage.createdAt }
          : conv
      )),
      messagesByConversationId: {
        ...state.messagesByConversationId,
        [nextMessage.conversationId]: messages
      }
    };
  }),

  sendMessage: async (conversationId, content) => {
    const clientId = makeClientId();
    const now = new Date().toISOString();
    const currentUserId = useAuthStore.getState().user?._id || '';
    const optimisticMessage: Message = {
      _id: clientId,
      conversationId,
      senderId: currentUserId,
      content,
      type: 'text',
      status: 'sending',
      createdAt: now,
      updatedAt: now,
      clientId,
      clientMessageId: clientId
    };

    get().addMessage(optimisticMessage);

    await new Promise<void>((resolve, reject) => {
      socket.timeout(10000).emit(
        'message:send',
        {
          conversationId,
          content,
          clientId,
          clientMessageId: clientId
        },
        (error: Error | null, ack?: MessageAck) => {
          if (error || !ack?.success) {
            get().markFailed(clientId);
            reject(error || new Error(ack?.error || String(ack?.message || 'Failed to send message')));
            return;
          }

          const serverMessage = typeof ack.message === 'object' ? ack.message : ack.data;

          if (!serverMessage) {
            get().markFailed(clientId);
            reject(new Error('Message ACK did not include a server message'));
            return;
          }

          get().confirmMessage(clientId, {
            ...serverMessage,
            clientId: serverMessage.clientId || serverMessage.clientMessageId || clientId,
            clientMessageId: serverMessage.clientMessageId || serverMessage.clientId || clientId
          });
          resolve();
        }
      );
    });
  },

  confirmMessage: (clientId, serverMessage) => set((state) => {
    const message = normalizeMessage({
      ...serverMessage,
      clientId: serverMessage.clientId || serverMessage.clientMessageId || clientId,
      clientMessageId: serverMessage.clientMessageId || serverMessage.clientId || clientId
    });
    const conversationMessages = state.messagesByConversationId[message.conversationId] || [];
    const updatedMessages = conversationMessages.some((msg) => getMessageClientId(msg) === clientId || msg._id === message._id)
      ? conversationMessages.map((msg) => (
        getMessageClientId(msg) === clientId || msg._id === message._id ? message : msg
      ))
      : [...conversationMessages, message];

    return {
      conversations: state.conversations.map((conversation) => (
        conversation._id === message.conversationId
          ? { ...conversation, lastMessage: message, updatedAt: message.createdAt }
          : conversation
      )),
      messagesByConversationId: {
        ...state.messagesByConversationId,
        [message.conversationId]: updatedMessages
      }
    };
  }),

  reconcileMessage: (serverMessage) => {
    const message = normalizeMessage(serverMessage);
    const clientId = getMessageClientId(message);

    if (clientId) {
      get().confirmMessage(clientId, message);
      return;
    }

    get().addMessage(message);
  },

  markFailed: (clientId) => set((state) => {
    const messagesByConversationId = Object.fromEntries(
      Object.entries(state.messagesByConversationId).map(([conversationId, messages]) => [
        conversationId,
        messages.map((message) => (
          getMessageClientId(message) === clientId ? { ...message, status: 'failed' as const } : message
        ))
      ])
    );

    return { messagesByConversationId };
  }),

  markMessageFailed: (clientId) => get().markFailed(clientId),

  updateConversationLastMessage: (message) => set((state) => ({
    conversations: state.conversations.map((conversation) => (
      conversation._id === message.conversationId
        ? { ...conversation, lastMessage: message, updatedAt: message.createdAt }
        : conversation
    ))
  })),

  updateUserPresence: (userId, isOnline) => {
    set((state) => ({
      userPresence: {
        ...state.userPresence,
        [userId]: isOnline
      }
    }));
  },

  setUserOnline: (userId) => get().updateUserPresence(userId, true),

  setUserOffline: (userId) => get().updateUserPresence(userId, false),

  addUserTyping: (conversationId, userId) => {
    set((state) => {
      const currentTypingUsers = state.typingUsersByConversation[conversationId] || [];
      const updatedTypingUsers = [...new Set([...currentTypingUsers, userId])]; // Prevent duplicates
      
      return {
        typingUsersByConversation: {
          ...state.typingUsersByConversation,
          [conversationId]: updatedTypingUsers
        }
      };
    });
  },

  removeUserTyping: (conversationId, userId) => {
    set((state) => {
      const currentTypingUsers = state.typingUsersByConversation[conversationId] || [];
      const updatedTypingUsers = currentTypingUsers.filter(id => id !== userId);
      
      return {
        typingUsersByConversation: {
          ...state.typingUsersByConversation,
          [conversationId]: updatedTypingUsers
        }
      };
    });
  },

  updateMessageStatus: (messageId, status) => {
    set((state) => {
      const updatedMessagesByConversationId = { ...state.messagesByConversationId };
      
      for (const [conversationId, messages] of Object.entries(updatedMessagesByConversationId)) {
        const messageIndex = messages.findIndex(msg => msg._id === messageId || getMessageClientId(msg) === messageId);
        if (messageIndex !== -1) {
          const updatedMessages = [...messages];
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            status
          };
          
          updatedMessagesByConversationId[conversationId] = updatedMessages;
          break;
        }
      }
      
      return {
        messagesByConversationId: updatedMessagesByConversationId
      };
    });
  },

  markConversationMessagesAsRead: (conversationId, currentUserId) => {
    set((state) => {
      const updatedMessagesByConversationId = { ...state.messagesByConversationId };
      const messages = updatedMessagesByConversationId[conversationId];
      
      if (!messages) return state;
      
      // Only mark messages NOT sent by current user as read
      const updatedMessages = messages.map((msg: any) => {
        const senderId = typeof msg.senderId === 'string' ? msg.senderId : msg.senderId?._id;
        if (senderId !== currentUserId && msg.status !== 'read') {
          return { ...msg, status: 'read' as const };
        }
        return msg;
      });
      
      updatedMessagesByConversationId[conversationId] = updatedMessages;
      
      return {
        messagesByConversationId: updatedMessagesByConversationId
      };
    });
  },

  upsertConversation: (conversation) => {
    set((state) => {
      const existingIndex = state.conversations.findIndex(c => c._id === conversation._id);
      
      if (existingIndex >= 0) {
        // Update existing conversation
        const updatedConversations = [...state.conversations];
        updatedConversations[existingIndex] = conversation;
        
        return { conversations: updatedConversations };
      } else {
        // Prepend new conversation
        return { conversations: [conversation, ...state.conversations] };
      }
    });
  }
}));
