import { getOrCreateConversation, getUserConversations, getConversationMessages } from '../services/chat.service.js';
/**
 * Create or fetch a conversation between two users
 */
export const createOrFetchConversation = async (req, res) => {
    const { recipientUserId } = req.body;
    const userId = req.user?.sub; // Get user ID from auth middleware
    if (!recipientUserId) {
        return res.status(400).json({ message: 'Recipient user ID is required' });
    }
    try {
        const conversation = await getOrCreateConversation(userId, recipientUserId);
        res.status(200).json(conversation);
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
/**
 * Get all conversations for the authenticated user
 */
export const getUserChatConversations = async (req, res) => {
    const userId = req.user?.sub; // Get user ID from auth middleware
    try {
        const conversations = await getUserConversations(userId);
        res.status(200).json(conversations);
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
/**
 * Get messages for a conversation with pagination
 */
export const getConversationMessagesController = async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user?.sub; // Get user ID from auth middleware
    const { limit, cursor } = req.query;
    if (!conversationId) {
        return res.status(400).json({ message: 'Conversation ID is required' });
    }
    try {
        const parsedLimit = parseInt(limit) || 20;
        // Limit should be reasonable
        const finalLimit = Math.min(parsedLimit, 100);
        const messages = await getConversationMessages(conversationId, userId, finalLimit, cursor ? cursor : undefined);
        res.status(200).json(messages);
    }
    catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
//# sourceMappingURL=chat.controller.js.map