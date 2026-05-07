import { useCallback, useEffect, useState } from 'react';
import { useChat, useAuth } from '@/hooks';
import { userService } from '@/services/user.service';
import { http } from '@/services/http';
import { User, Conversation } from '@/types';
import UserListItem from './UserListItem';

interface UserPickerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserPicker({ isOpen, onClose }: UserPickerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { upsertConversation, setActiveConversation } = useChat();
  const { user: currentUser } = useAuth();

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedUsers = await userService.getUsers();
      const filteredUsers = fetchedUsers.filter((user) => user._id !== currentUser?._id);
      setUsers(fetchedUsers);
      setFilteredUsers(filteredUsers);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?._id]);

  useEffect(() => {
    const query = searchTerm.toLowerCase();
    const filtered = users.filter(user =>
      user._id !== currentUser?._id &&
      (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      )
    );
    setFilteredUsers(filtered);
  }, [currentUser?._id, searchTerm, users]);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen, loadUsers]);

  const handleUserSelect = async (user: User) => {
    try {
      // Check if current user is authenticated
      if (!currentUser || !currentUser._id) {
        setError('Please log in to continue');
        return;
      }
      
      // Create or fetch conversation with the selected user
      const response = await http.post<Conversation>('/chat/conversations', { recipientUserId: user._id });
      const conversation: Conversation = response.data;
      
      // Add/update conversation in store
      upsertConversation(conversation);
      
      // Set as active conversation
      setActiveConversation(conversation._id);
      
      // Close the picker
      onClose();
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setError('Failed to start conversation. Please try again.');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Start New Chat</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading users...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {users.length === 0 ? 'No users found' : 'No matching users'}
            </div>
          ) : (
            filteredUsers.map(user => (
              <UserListItem
                key={user._id}
                user={user}
                onClick={() => handleUserSelect(user)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
