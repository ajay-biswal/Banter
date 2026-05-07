import { MessageSquare } from 'lucide-react';

interface AuthHeaderProps {
  title?: string;
}

export function AuthHeader({ title = 'Banter' }: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center mb-8">
      {/* Logo icon */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
        <MessageSquare className="w-8 h-8 text-white" />
      </div>
      
      {/* App name */}
      <h1 className="mt-4 text-2xl font-medium text-white">
        {title}
      </h1>
    </div>
  );
}
