import mongoose from "mongoose";
import { getOrCreateConversation, getUserConversations, getConversationMessages } from '../services/chat.service.js';
import { Message } from "../models/message.model.js";
/**
 * Create or fetch a conversation between two users
 */
export const createOrFetchConversation = async (req, res) => {
    const { recipientUserId } = req.body;
    const userId = req.user?.id; // Get user ID from auth middleware
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
export const sendMessageController = async (req, res) => {
    try {
        const { conversationId, content } = req.body;
        const senderId = req.user?.id;
        if (!senderId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!conversationId || !content) {
            return res.status(400).json({ message: "Missing fields" });
        }
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({ message: "Invalid conversationId" });
        }
        console.log("conversationId:", conversationId);
        console.log("senderId:", senderId);
        console.log("content:", content);
        const message = await Message.create({
            conversationId,
            senderId,
            content,
        });
        const io = req.app.get("io");
        if (io) {
            io.to(`conversation:${conversationId}`).emit("message:new", message);
        }
        return res.status(201).json({ message });
    }
    catch (err) {
        console.error("🔥 SendMessageError:", err);
        return res.status(500).json({ message: "Failed to send message" });
    }
};
/**
 * Get all conversations for the authenticated user
 */
export const getUserChatConversations = async (req, res) => {
    const userId = req.user?.id; // Get user ID from auth middleware
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
    const conversationId = req.params.conversationId;
    const userId = req.user?.id; // Get user ID from auth middleware
    const { limit, cursor } = req.query;
    if (!conversationId || Array.isArray(conversationId)) {
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