import { http } from '@/services/http';
import { Conversation, Message } from '@/types';

export const chatService = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await http.get('/chat/conversations');
    return response.data as Conversation[];
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const response = await http.get(`/chat/conversations/${conversationId}/messages`);
    return response.data as Message[];
  }
};