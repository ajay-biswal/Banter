'use client';

import { Message } from '@/types';
import { useChat } from '@/hooks';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  isGrouped?: boolean;
  isLastInGroup?: boolean;
  isFirstInGroup?: boolean;
  showAvatar?: boolean;
  senderName?: string;
  senderAvatar?: string;
}

export default function MessageBubble({ 
  message, 
  isOwn, 
  isGrouped = false, 
  isLastInGroup = true,
  isFirstInGroup = false,
  showAvatar = false,
  senderName,
  senderAvatar
}: MessageBubbleProps) {
  const { retryMessage } = useChat();

  const handleRetry = () => {
    if (message.clientMessageId) {
      retryMessage(message.clientMessageId);
    }
  };

  // Determine styling based on message status and sender
  const bubbleColor = isOwn 
    ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-600 text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-shadow duration-200' 
    : 'bg-slate-800/80 backdrop-blur-sm text-white border border-white/5';
  
  // Status-specific styling
  let statusStyle = '';
  if (message.status === 'sending') {
    statusStyle = 'opacity-60'; // Muted appearance for sending
  } else if (message.status === 'failed') {
    statusStyle = 'bg-red-500/10 border border-red-500/30'; // Red highlight for failed
  }

  return (
    <div className="flex w-full group">
      {/* Avatar container - only show on LAST message in group for incoming messages */}
      {!isOwn && showAvatar && (
        <div className="flex-shrink-0 w-8">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xs font-semibold shadow-lg">
            {senderAvatar || senderName?.charAt(0).toUpperCase() || '?'}
          </div>
        </div>
      )}
      {!isOwn && !showAvatar && <div className="flex-shrink-0 w-8" />}
      
      {/* Message container */}
      <div className={`flex flex-col ${isOwn ? 'ml-auto items-end' : 'items-start'}`} style={{ maxWidth: 'clamp(70%, 80%, 65%)' }}>
        {/* Sender name (for group chats) */}
        {showAvatar && senderName && !isOwn && (
          <div className="text-xs text-purple-400 font-medium mb-1 ml-1">{senderName}</div>
        )}
        
        {/* Message bubble */}
        <div className={`${bubbleColor} ${statusStyle} px-4 py-2.5 shadow-lg ${
          isOwn ? 'shadow-indigo-500/30' : 'shadow-black/20'
        } hover:scale-[1.01] transition-all duration-200 ${
          // Adjust border radius for grouped messages - creates connected bubble effect
          isGrouped 
            ? isLastInGroup && isFirstInGroup
              ? 'rounded-xl' // Single message (both first and last)
              : isFirstInGroup
                ? 'rounded-t-xl rounded-b-[4px]' // First in group - tight bottom corner
                : isLastInGroup
                  ? 'rounded-xl' // Last in group (show avatar here)
                  : 'rounded-t-xl rounded-b-[4px]' // Middle of group - tight bottom corner
            : 'rounded-xl' // Non-grouped message
        }`}>
          {/* Message content */}
          {message.content && (
            <div className="text-[15px] leading-relaxed">{message.content}</div>
          )}
          
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="space-y-2 mt-2">
              {message.attachments.map((attachment: any, index: number) => {
                const isImage = attachment.type === 'image';
                const isVideo = attachment.type === 'video';
                
                if (isImage) {
                  return (
                    <div key={index} className="rounded-lg overflow-hidden">
                      <img
                        src={attachment.url}
                        alt={attachment.name || 'Image'}
                        className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(attachment.url, '_blank')}
                      />
                    </div>
                  );
                }
                
                if (isVideo) {
                  return (
                    <div key={index} className="rounded-lg overflow-hidden">
                      <video
                        src={attachment.url}
                        controls
                        className="max-w-xs rounded-lg"
                      />
                    </div>
                  );
                }
                
                // File attachment
                return (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 group border border-white/10 hover:border-purple-500/30"
                  >
                    <div className="w-10 h-10 rounded bg-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/30 transition-colors">
                      <svg className="w-5 h-5 text-purple-400 group-hover:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{attachment.name}</p>
                      {attachment.size && (
                        <p className="text-xs opacity-60">
                          {(attachment.size / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>
                    <svg className="w-4 h-4 flex-shrink-0 opacity-60 group-hover:opacity-100 group-hover:text-purple-400 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                );
              })}
            </div>
          )}
          
          {/* Timestamp and status */}
          <div className={`text-[11px] mt-1.5 flex items-center justify-end gap-1 ${
            isOwn ? 'text-white/60' : 'text-gray-500'
          }`}>
            {/* Message status icons (sender only) */}
            {isOwn && message.status === 'sending' && (
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {isOwn && message.status === 'sent' && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {isOwn && message.status === 'delivered' && (
              <div className="flex -space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {isOwn && message.status === 'read' && (
              <div className="flex -space-x-1">
                <svg className="w-3 h-3 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <svg className="w-3 h-3 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {message.status === 'failed' && (
              <button 
                onClick={handleRetry}
                className="text-red-400 hover:text-red-300 transition-colors"
                title="Retry sending"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </button>
            )}
            <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
