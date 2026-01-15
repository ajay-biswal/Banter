import { useChat } from '@/hooks';
import { useAuth } from '@/hooks';
import { Conversation } from '@/types';

export default function ChatHeader() {
  const { activeConversationId, conversations } = useChat();
  const { user } = useAuth();

  // Find the active conversation
  const activeConversation = conversations.find(
    conversation => conversation._id === activeConversationId
  );

  // Get the other participant (not the current user)
  const otherParticipant = activeConversation?.participants.find(
    participant => participant._id !== user?._id
  );

  return (
    <div className="bg-white p-4 border-b border-gray-200 flex items-center">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
          {otherParticipant?.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{otherParticipant?.name}</h3>
          {/* Placeholder for presence/typing indicators */}
        </div>
      </div>
    </div>
  );
}