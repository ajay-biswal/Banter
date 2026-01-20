'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '@/hooks';
import { useAuth } from '@/hooks';
import MessageBubble from './MessageBubble';
import { Message } from '@/types';

export default function MessageList() {
  const { activeConversationId, messagesByConversationId } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get messages for the active conversation
  const messages: Message[] = messagesByConversationId[activeConversationId || ''] || [];

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, activeConversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            isOwn={message.senderId === user?._id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}