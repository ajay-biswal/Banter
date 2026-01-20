import { Conversation, User } from '@/types';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  currentUserId: string;
  userPresence?: Record<string, boolean>;
}

export default function ConversationItem({ conversation, isActive, currentUserId, userPresence }: ConversationItemProps) {
  // Get the other participant (not the current user)
  const otherParticipant = conversation.participants.find(
    participant => participant._id !== currentUserId
  );

  // Get presence status
  const isOnline = otherParticipant && userPresence ? userPresence[otherParticipant._id] : false;

  // Get the last message preview
  const lastMessagePreview = conversation.lastMessage
    ? conversation.lastMessage.content
    : 'No messages yet';

  // Truncate the last message if too long
  const truncatedMessage = lastMessagePreview.length > 30
    ? lastMessagePreview.substring(0, 30) + '...'
    : lastMessagePreview;

  return (
    <div className={`p-3 border-b border-gray-100 ${isActive ? 'bg-blue-50' : ''}`}>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium relative ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}>
            {otherParticipant?.name.charAt(0).toUpperCase()}
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 truncate">
              {otherParticipant?.name}
            </h3>
            {conversation.updatedAt && (
              <span className="text-xs text-gray-500">
                {new Date(conversation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">
            {truncatedMessage}
          </p>
        </div>
        {conversation.unreadCount > 0 && (
          <div className="flex-shrink-0">
            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
              {conversation.unreadCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}