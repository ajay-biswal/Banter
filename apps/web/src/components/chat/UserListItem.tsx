import { User } from '@/types';

interface UserListItemProps {
  user: User;
  onClick: () => void;
}

export default function UserListItem({ user, onClick }: UserListItemProps) {
  return (
    <div 
      className="p-3 border-b border-slate-100 hover:bg-violet-50 cursor-pointer flex items-center space-x-3 transition-colors"
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-white font-medium">
          {user.name.charAt(0).toUpperCase()}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-slate-900 truncate">
          {user.name}
        </h3>
        <p className="text-sm text-slate-500 truncate">
          {user.email}
        </p>
      </div>
    </div>
  );
}