'use client';

import { useEffect } from 'react';
import { useChat } from '@/hooks';
import ChatLayout from '@/components/chat/ChatLayout';

export default function ChatPage() {
  const { conversations, setConversations } = useChat();
  const { getConversations } = useChat();

  // Fix: useEffect should run exactly once on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const convos = await getConversations();
        setConversations(convos);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      }
    };

    fetchConversations();
  }, []); // Empty dependency array - run once only

  // Always render ChatLayout - empty state handled internally
  return <ChatLayout />;
}