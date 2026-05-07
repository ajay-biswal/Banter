import { useChat } from '@/hooks';
import { useAuth } from '@/hooks';

interface ChatHeaderProps {
  onToggleInfo: () => void;
  showInfo: boolean;
  onShowProfile?: () => void;
}

export default function ChatHeader({ onToggleInfo, showInfo, onShowProfile }: ChatHeaderProps) {
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
    <div className="bg-slate-900/50 backdrop-blur-sm border-b border-white/5 px-3 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        {/* Left: Back Button (Mobile) + Avatar + Info */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Back Button - Mobile Only */}
          <button
            className="md:hidden p-2 min-h-10 min-w-10 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            onClick={() => window.history.back()}
            aria-label="Back to conversations"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Avatar */}
          <div className="relative">
            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-semibold ${
              isOnline 
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' 
                : 'bg-gradient-to-br from-slate-600 to-slate-700'
            }`}>
              {otherParticipant?.name.charAt(0).toUpperCase()}
            </div>
            {/* Online indicator */}
            {isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-3.5 md:h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
            )}
          </div>
          
          {/* User info */}
          <div>
            <h3 className="text-white font-semibold text-sm md:text-base">{otherParticipant?.name}</h3>
            {isTyping ? (
              <p className="text-xs text-purple-400 animate-pulse">typing...</p>
            ) : isOnline ? (
              <p className="text-xs text-emerald-400">online</p>
            ) : (
              <p className="text-xs text-gray-500">offline</p>
            )}
          </div>
        </div>
        
        {/* Right: Action Icons */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Voice Call */}
          <button
            className="p-2 min-h-10 min-w-10 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            aria-label="Voice call"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          
          {/* Video Call */}
          <button
            className="p-2 min-h-10 min-w-10 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            aria-label="Video call"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          
          {/* Info Toggle - Desktop: Toggle panel, Mobile: Open drawer */}
          <button
            onClick={() => onShowProfile ? onShowProfile() : onToggleInfo()}
            className={`p-2 min-h-10 min-w-10 rounded-lg transition-all duration-200 ${
              showInfo 
                ? 'text-purple-400 bg-purple-500/10 hover:bg-purple-500/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            aria-label="Toggle conversation info"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
