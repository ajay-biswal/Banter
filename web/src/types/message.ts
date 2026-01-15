export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: string;
  status: 'sent' | 'delivered' | 'read' | 'sending' | 'failed';
  createdAt: string;
  updatedAt: string;
  clientMessageId?: string;
}