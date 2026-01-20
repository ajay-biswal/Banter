'use client';

import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';

export default function ChatLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/3 bg-white border-r border-gray-200">
        <Sidebar />
      </div>
      <div className="w-2/3 flex flex-col">
        <ChatWindow />
      </div>
    </div>
  );
}