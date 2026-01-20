import { useState } from 'react';

interface NewChatButtonProps {
  onClick: () => void;
}

export default function NewChatButton({ onClick }: NewChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="mb-4 mx-4 w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
    >
      New Chat
    </button>
  );
}