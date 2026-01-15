import { Types } from 'mongoose';
import { User } from '../models/user.model.js';
import { AppError } from '../utils/AppError.js';
/**
 * Get current user by ID
 * Fetches user from database and returns sanitized user object
 */
export const getCurrentUser = async (userId) => {
    // Validate userId format
    if (!Types.ObjectId.isValid(userId)) {
        throw new AppError('Invalid user ID format', 400);
    }
    // Fetch user from database with only safe fields
    const user = await User.findById(userId).select('_id name email role');
    // Throw error if user doesn't exist
    if (!user) {
        throw new AppError('User not found', 404);
    }
    return user;
};
//# sourceMappingURL=auth.service.js.map