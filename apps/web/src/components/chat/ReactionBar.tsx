'use client';

interface Reaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

interface ReactionBarProps {
  reactions: Reaction[];
  onReactionClick: (emoji: string) => void;
}

export default function ReactionBar({ reactions, onReactionClick }: ReactionBarProps) {
  if (reactions.length === 0) return null;

  return (
    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          type="button"
          onClick={() => onReactionClick(reaction.emoji)}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all duration-200 ${
            reaction.reacted
              ? 'bg-purple-500/30 border border-purple-500/50 text-white'
              : 'bg-white/10 border border-white/10 text-gray-300 hover:bg-white/15'
          }`}
        >
          <span>{reaction.emoji}</span>
          <span className="font-medium">{reaction.count}</span>
        </button>
      ))}
    </div>
  );
}
