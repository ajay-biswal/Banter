'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import { Theme } from 'emoji-picker-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Dynamically import emoji-picker-react to avoid SSR issues
const EmojiPickerReact = dynamic(
  () => import('emoji-picker-react'),
  { ssr: false }
);

export default function EmojiPicker({ onEmojiSelect, isOpen, onClose }: EmojiPickerProps) {
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

  const handleEmojiClick = (emojiObject: any) => {
    onEmojiSelect(emojiObject.emoji);
    onClose();
  };

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-16 left-0 z-50 animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="rounded-xl border border-white/10 shadow-lg shadow-black/40 overflow-hidden">
        <EmojiPickerReact
          onEmojiClick={handleEmojiClick}
          theme={Theme.DARK}
          previewConfig={{
            showPreview: false,
          }}
          searchPlaceHolder="Search emoji"
          style={{
            width: '350px',
            height: '400px',
          }}
        />
      </div>
    </div>
  );
}
