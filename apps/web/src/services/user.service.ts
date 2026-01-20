import { http } from '@/services/http';
import { User } from '@/types';

export const userService = {
  /**
   * Get all users except the current user
   */
  getUsers: async (): Promise<User[]> => {
    const response = await http.get('/users');
    return response.data as User[];
  }
};