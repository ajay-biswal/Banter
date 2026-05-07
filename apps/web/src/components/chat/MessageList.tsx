'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useChat } from '@/hooks';
import { useAuth } from '@/hooks';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { Message } from '@/types';

export default function MessageList() {
  const { activeConversationId, messagesByConversationId } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper to normalize senderId from different message structures
  // Handles: string, object with _id, nested sender object
  const getSenderId = (message: any): string | null => {
    // If senderId is a string, return it directly
    if (typeof message.senderId === 'string') {
      return message.senderId;
    }
    // If senderId is an object with _id property
    if (message.senderId && typeof message.senderId === 'object' && message.senderId._id) {
      return message.senderId._id;
    }
    // If there's a nested sender object with _id
    if (message.sender && typeof message.sender === 'object' && message.sender._id) {
      return message.sender._id;
    }
    // Fallback: return null
    return null;
  };

  // Helper to format date label (WhatsApp-style)
  const formatDateLabel = (dateString: string): string => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if message is from today
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }

    // Check if message is from yesterday
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // Format as "12 Aug 2025"
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return messageDate.toLocaleDateString('en-GB', options);
  };

  // Helper to get date key for grouping
  const getDateKey = (dateString: string): string => {
    return new Date(dateString).toDateString();
  };

  // Get messages for the active conversation
  const messages: Message[] = useMemo(
    () => messagesByConversationId[activeConversationId || ''] || [],
    [activeConversationId, messagesByConversationId]
  );

  // Group messages by date and create render structure
  const groupedMessages = useMemo(() => {
    if (messages.length === 0) return [];

    const groups: Array<{ dateLabel: string; messages: Message[]; showLabel: boolean }> = [];
    let currentDateKey = '';

    messages.forEach((message) => {
      const messageDateKey = getDateKey(message.createdAt);

      // If this is a new date, create a new group
      if (messageDateKey !== currentDateKey) {
        currentDateKey = messageDateKey;
        groups.push({
          dateLabel: formatDateLabel(message.createdAt),
          messages: [message],
          showLabel: true
        });
      } else {
        // Add to existing group
        groups[groups.length - 1].messages.push(message);
      }
    });

    return groups;
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversationId]);

  // Helper to check if message is from same sender as previous
  const isSameSenderAsPrevious = (index: number): boolean => {
    if (index === 0) return false;
    const currentSenderId = getSenderId(messages[index]);
    const previousSenderId = getSenderId(messages[index - 1]);
    return currentSenderId === previousSenderId && currentSenderId !== null;
  };

  // Helper to check if message is from same sender as next
  const isSameSenderAsNext = (index: number): boolean => {
    if (index === messages.length - 1) return false;
    const currentSenderId = getSenderId(messages[index]);
    const nextSenderId = getSenderId(messages[index + 1]);
    return currentSenderId === nextSenderId && currentSenderId !== null;
  };

  // Get typing users for active conversation
  const { typingUsersByConversation, conversations } = useChat();
  const typingUsers = activeConversationId ? typingUsersByConversation[activeConversationId] || [] : [];
  
  // Get typing user names
  const typingUserNames = typingUsers.map((userId: string) => {
    const activeConvo = conversations.find(c => c._id === activeConversationId);
    const typingUser = activeConvo?.participants.find(p => p._id === userId);
    return typingUser?.name;
  }).filter(Boolean);

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 to-slate-950/90">
      {/* Centered conversation lane - constrained width for large screens */}
      <div className="w-full max-w-4xl mx-auto px-3 md:px-6 py-4 pb-24">
        <div className="space-y-0.5">
          {groupedMessages.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* Date Separator */}
              {group.showLabel && (
                <div className="flex justify-center my-4 animate-in fade-in duration-200">
                  <div className="bg-slate-800/60 backdrop-blur-sm text-gray-400 text-xs font-medium px-4 py-1.5 rounded-full shadow-lg shadow-black/10">
                    {group.dateLabel}
                  </div>
                </div>
              )}

              {/* Messages in this date group */}
              {group.messages.map((message, msgIndex) => {
                // Calculate global index for sender grouping logic
                const globalIndex = messages.findIndex(m => m._id === message._id);
                
                // CRITICAL: Normalize senderId before comparison
                // Handles different structures from socket vs backend
                const messageSenderId = getSenderId(message);
                const currentUserId = user?._id;
                const isOwn = messageSenderId && currentUserId ? messageSenderId === currentUserId : false;
                
                // Debug: Log message structure to identify senderId format (only first message)
                if (globalIndex === 0) {
                  console.log('🔍 Message structure debug:', {
                    message,
                    messageSenderId,
                    currentUserId,
                    isOwn,
                    senderIdType: typeof message.senderId,
                    messageContent: message.content.substring(0, 50)
                  });
                }
                
                const sameAsPrevious = isSameSenderAsPrevious(globalIndex);
                const sameAsNext = isSameSenderAsNext(globalIndex);
                const isFirstInGroup = !sameAsPrevious;
                const isLastInGroup = !sameAsNext;
                
                // Get sender info for incoming messages
                const activeConvo = conversations.find(c => c._id === activeConversationId);
                const sender = activeConvo?.participants.find(p => p._id === messageSenderId);
                // CRITICAL: Show avatar only on LAST message in group (not first)
                const showAvatar = !isOwn && isLastInGroup;

                return (
                  <div
                    key={message._id}
                    className={`${
                      // Tighter spacing inside group (2px), larger gap between different senders (16px)
                      !sameAsPrevious ? 'mt-4' : 'mt-0.5'
                    } animate-in fade-in slide-in-from-bottom-2 duration-200`}
                  >
                    <MessageBubble
                      message={message}
                      isOwn={isOwn}
                      isGrouped={sameAsPrevious}
                      isLastInGroup={isLastInGroup}
                      isFirstInGroup={isFirstInGroup}
                      showAvatar={showAvatar}
                      senderName={sender?.name}
                      senderAvatar={sender?.name?.charAt(0).toUpperCase()}
                    />
                  </div>
                );
              })}
            </div>
          ))}
          
          {/* Typing indicator */}
          {typingUserNames.length > 0 && (
            <div className="mt-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <TypingIndicator userName={typingUserNames[0]} />
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
