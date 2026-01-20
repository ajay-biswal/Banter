import { useChat } from '@/hooks';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

export default function ChatWindow() {
  const { activeConversationId } = useChat();

  if (!activeConversationId) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Select a conversation</h2>
          <p className="text-gray-500 mt-2">Choose a chat from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader />
      <MessageList />
      <MessageInput />
    </div>
  );
}