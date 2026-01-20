import { Types } from 'mongoose';
import { Message } from '../models/message.model.js';
import { Conversation } from '../models/conversation.model.js';
import { AppError } from '../utils/AppError.js';
/**
 * Update message status to delivered
 * Only updates messages that are currently in "sent" status
 */
export const markMessagesDelivered = async (messageIds, userId) => {
    // Validate message IDs
    const validMessageIds = messageIds.filter(id => Types.ObjectId.isValid(id));
    if (validMessageIds.length === 0) {
        throw new AppError('No valid message IDs provided', 400);
    }
    // Convert to ObjectIds
    const objectIdArray = validMessageIds.map(id => new Types.ObjectId(id));
    // Update messages that are currently in "sent" status
    const result = await Message.updateMany({
        _id: { $in: objectIdArray },
        status: 'sent',
        senderId: { $ne: userId } // Don't mark own messages as delivered
    }, {
        $set: {
            status: 'delivered',
            updatedAt: new Date()
        }
    });
    return result;
};
/**
 * Update message status to read
 * Only updates messages that are currently in "sent" or "delivered" status
 */
export const markMessagesRead = async (messageIds, userId, conversationId) => {
    // Validate message IDs
    const validMessageIds = messageIds.filter(id => Types.ObjectId.isValid(id));
    if (validMessageIds.length === 0) {
        throw new AppError('No valid message IDs provided', 400);
    }
    // Convert to ObjectIds
    const objectIdArray = validMessageIds.map(id => new Types.ObjectId(id));
    // Update messages that are currently in "sent" or "delivered" status
    const result = await Message.updateMany({
        _id: { $in: objectIdArray },
        status: { $in: ['sent', 'delivered'] }, // Only update messages that aren't already read
        senderId: { $ne: userId } // Don't mark own messages as read
    }, {
        $set: {
            status: 'read',
            updatedAt: new Date()
        }
    });
    // Update the conversation's last message if the last message was marked as read
    const lastMessage = await Message.findOne({
        conversationId: new Types.ObjectId(conversationId),
        senderId: { $ne: userId }
    }).sort({ createdAt: -1 });
    if (lastMessage) {
        await Conversation.updateOne({ _id: new Types.ObjectId(conversationId) }, { lastMessage: lastMessage._id });
    }
    return result;
};
/**
 * Mark all messages in a conversation as read up to a certain message
 */
export const markConversationMessagesRead = async (conversationId, userId, lastReadMessageId) => {
    // Validate conversation ID
    if (!Types.ObjectId.isValid(conversationId)) {
        throw new AppError('Invalid conversation ID', 400);
    }
    // Build query to find messages to update
    const query = {
        conversationId: new Types.ObjectId(conversationId),
        status: { $in: ['sent', 'delivered'] }, // Only update messages that aren't already read
        senderId: { $ne: userId } // Don't mark own messages as read
    };
    // If a specific message ID is provided, only mark messages up to that point as read
    if (lastReadMessageId) {
        if (!Types.ObjectId.isValid(lastReadMessageId)) {
            throw new AppError('Invalid message ID', 400);
        }
        // Add condition to only update messages up to the specified message
        query._id = { $lte: new Types.ObjectId(lastReadMessageId) };
    }
    const result = await Message.updateMany(query, {
        $set: {
            status: 'read',
            updatedAt: new Date()
        }
    });
    // Update the conversation's last message
    const lastMessage = await Message.findOne({
        conversationId: new Types.ObjectId(conversationId),
        senderId: { $ne: userId }
    }).sort({ createdAt: -1 });
    if (lastMessage) {
        await Conversation.updateOne({ _id: new Types.ObjectId(conversationId) }, { lastMessage: lastMessage._id });
    }
    return result;
};
/**
 * Get message status for a specific message
 */
export const getMessageStatus = async (messageId) => {
    if (!Types.ObjectId.isValid(messageId)) {
        throw new AppError('Invalid message ID', 400);
    }
    const message = await Message.findById(messageId).select('status');
    return message;
};
//# sourceMappingURL=readReceipt.service.js.map