export interface Attachment {
  url: string;
  type: string; // 'image', 'video', 'file'
  name: string;
  size?: number;
  format?: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: string;
  status: 'sent' | 'delivered' | 'read' | 'sending' | 'failed';
  createdAt: string;
  updatedAt: string;
  clientId?: string;
  clientMessageId?: string;
  attachments?: Attachment[];
  metadata?: {
    attachments?: Attachment[];
  };
}
