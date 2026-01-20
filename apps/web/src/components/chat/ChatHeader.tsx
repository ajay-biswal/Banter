import { useChat } from '@/hooks';
import { useAuth } from '@/hooks';
import { Conversation, User } from '@/types';

export default function ChatHeader() {
  const { activeConversationId, conversations, typingUsersByConversation, userPresence } = useChat();
  const { user } = useAuth();

  // Find the active conversation
  const activeConversation = conversations.find(
    conversation => conversation._id === activeConversationId
  );

  // Get the other participant (not the current user)
  const otherParticipant = activeConversation?.participants.find(
    participant => participant._id !== user?._id
  );

  // Check if the other participant is typing
  const isTyping = otherParticipant && activeConversationId && 
    typingUsersByConversation[activeConversationId]?.includes(otherParticipant._id);

  // Check if the other participant is online
  const isOnline = otherParticipant ? userPresence[otherParticipant._id] : false;

  return (
    <div className="bg-white p-4 border-b border-gray-200 flex items-center">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium relative ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}>
          {otherParticipant?.name.charAt(0).toUpperCase()}
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
          )}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{otherParticipant?.name}</h3>
          {isTyping && (
            <p className="text-xs text-gray-500">is typing...</p>
          )}
          {!isTyping && isOnline && (
            <p className="text-xs text-green-600">online</p>
          )}
          {!isTyping && !isOnline && (
            <p className="text-xs text-gray-500">offline</p>
          )}
        </div>
      </div>
    </div>
  );
}