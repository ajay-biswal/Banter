import { Message } from '@/types';
import { useChat } from '@/hooks';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const { retryMessage } = useChat();

  const handleRetry = () => {
    if (message.clientMessageId) {
      retryMessage(message.clientMessageId);
    }
  };

  // Determine styling based on message status and sender
  const bubbleColor = isOwn ? 'bg-blue-500 text-white' : 'bg-white text-gray-800';
  const alignment = isOwn ? 'ml-auto' : 'mr-auto';
  const borderColor = isOwn ? 'border-blue-300' : 'border-gray-300';
  
  // Status-specific styling
  let statusStyle = '';
  if (message.status === 'sending') {
    statusStyle = 'opacity-60'; // Muted appearance for sending
  } else if (message.status === 'failed') {
    statusStyle = 'bg-red-100 border border-red-300'; // Red highlight for failed
  }

  return (
    <div className={`flex ${alignment} max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl`}>
      <div className={`${bubbleColor} ${statusStyle} rounded-lg px-4 py-2 shadow-sm`}>
        <div className="text-sm">{message.content}</div>
        <div className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'} flex items-center justify-end`}>
          {message.status === 'sending' && (
            <span className="mr-2">Sending...</span>
          )}
          {message.status === 'failed' && (
            <button 
              onClick={handleRetry}
              className="text-red-500 hover:text-red-700 underline mr-2"
            >
              Retry
            </button>
          )}
          {/* Show message status indicators for own messages */}
          {isOwn && message.status !== 'sending' && message.status !== 'failed' && (
            <span className="mr-1">
              {message.status === 'sent' && '✓'}
              {message.status === 'delivered' && '✓✓'}
              {message.status === 'read' && <span className="text-blue-300">✓✓</span>}
            </span>
          )}
          <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
}