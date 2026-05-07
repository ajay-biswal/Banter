'use client';

import { useEffect, useRef } from 'react';

interface MiniEmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Quick reaction emojis
const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export default function MiniEmojiPicker({ onEmojiSelect, isOpen, onClose }: MiniEmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      className="absolute -top-12 right-0 bg-slate-900 rounded-full border border-white/10 shadow-lg shadow-black/30 px-2 py-1.5 animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="flex items-center gap-0.5">
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              onEmojiSelect(emoji);
              onClose();
            }}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-white/10 rounded-full transition-all duration-150 hover:scale-125"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
