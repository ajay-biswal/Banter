import { Conversation } from '@/types';

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
    <div className={`p-3 rounded-xl ${isActive ? '' : ''}`}>
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 relative">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
            isOnline 
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' 
              : 'bg-gradient-to-br from-slate-600 to-slate-700'
          }`}>
            {otherParticipant?.name.charAt(0).toUpperCase()}
          </div>
          {/* Online indicator */}
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <h3 className={`font-semibold truncate ${
              isActive ? 'text-white' : 'text-gray-200'
            }`}>
              {otherParticipant?.name}
            </h3>
            {conversation.updatedAt && (
              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                {new Date(conversation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 truncate">
            {truncatedMessage}
          </p>
        </div>
        
        {/* Unread badge */}
        {conversation.unreadCount > 0 && (
          <div className="flex-shrink-0">
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-lg shadow-pink-500/30">
              {conversation.unreadCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
