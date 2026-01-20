import { Request, Response } from 'express';
import { User } from '../models/user.model.js';

/**
 * Get all users except the current user
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user?.id;
    
    // Find all users except the current user
    const users = await User.find({ _id: { $ne: currentUserId } }).select('_id name email');
    
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};