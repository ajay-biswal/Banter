interface TypingIndicatorProps {
  userName?: string;
}

export default function TypingIndicator({ userName }: TypingIndicatorProps) {
  return (
    <div className="px-6 py-1 flex items-center gap-2">
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-lg shadow-black/10">
        <div className="flex items-center gap-1.5">
          {/* Animated dots with staggered delays */}
          <div 
            className="w-1.5 h-1.5 bg-gray-400/60 rounded-full animate-bounce" 
            style={{ animationDelay: '0ms' }}
          />
          <div 
            className="w-1.5 h-1.5 bg-gray-400/60 rounded-full animate-bounce" 
            style={{ animationDelay: '150ms' }}
          />
          <div 
            className="w-1.5 h-1.5 bg-gray-400/60 rounded-full animate-bounce" 
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
      {userName && (
        <span className="text-xs text-gray-500/80 font-medium">{userName} is typing...</span>
      )}
    </div>
  );
}
