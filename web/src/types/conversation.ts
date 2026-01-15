import { Message } from './message';

export interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
}