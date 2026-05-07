import { User } from '../models/user.model.js';
/**
 * Get all users except the current user
 */
export const getAllUsers = async (req, res) => {
    try {
        const currentUserId = req.user?.id;
        // Find all users except the current user
        const users = await User.find({ _id: { $ne: currentUserId } }).select('_id name email');
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//# sourceMappingURL=user.controller.js.map