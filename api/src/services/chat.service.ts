import { Types } from 'mongoose';
import { Conversation } from '../models/conversation.model.js';
import { Message } from '../models/message.model.js';
import { User } from '../models/user.model.js';
import { AppError } from '../utils/AppError.js';

/**
 * Get or create a conversation between two users
 * Ensures only one conversation exists per user pair
 */
export const getOrCreateConversation = async (userId: string, recipientUserId: string) => {
  // Validate that userId and recipientUserId are different
  if (userId === recipientUserId) {
    throw new AppError('Cannot create a conversation with yourself', 400);
  }

  // Validate ObjectId format
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(recipientUserId)) {
    throw new AppError('Invalid user ID format', 400);
  }

  // Sort user IDs to ensure consistent ordering for lookup
  const participantIds = [new Types.ObjectId(userId), new Types.ObjectId(recipientUserId)]
    .sort((a, b) => a.toString().localeCompare(b.toString()));

  // Try to find existing conversation with these participants
  let conversation = await Conversation.findOne({
    type: 'direct',
    participants: { $size: 2, $all: participantIds }
  }).populate('participants', '_id name email');

  if (conversation) {
    return conversation;
  }

  // If no conversation exists, create a new one
  conversation = new Conversation({
    type: 'direct',
    participants: participantIds
  });

  await conversation.save();
  
  // Populate before returning
  await conversation.populate('participants', '_id name email');
  
  return conversation;
};

/**
 * Get all conversations for a user
 */
export const getUserConversations = async (userId: string) => {
  // Validate ObjectId format
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError('Invalid user ID format', 400);
  }

  const userObjectId = new Types.ObjectId(userId);

  const conversations = await Conversation.find({
    participants: { $in: [userObjectId] }
  })
    .populate('participants', '_id name email')
    .populate('lastMessage', '_id content senderId createdAt status')
    .sort({ updatedAt: -1 }); // Sort by updatedAt descending (most recent first)

  // Populate sender info in lastMessage
  const populatedConversations = await Promise.all(conversations.map(async (conv) => {
    if (conv.lastMessage) {
      const lastMessage = conv.lastMessage as any;
      if (lastMessage.senderId) {
        const sender = await User.findById(lastMessage.senderId).select('_id name email');
        lastMessage.sender = sender;
      }
    }
    return conv;
  }));

  return populatedConversations;
};

/**
 * Get messages for a conversation with pagination
 */
export const getConversationMessages = async (
  conversationId: string,
  userId: string,
  limit: number = 20,
  cursor?: string
) => {
  // Validate ObjectId formats
  if (!Types.ObjectId.isValid(conversationId) || !Types.ObjectId.isValid(userId)) {
    throw new AppError('Invalid ID format', 400);
  }

  // Verify user is a participant in the conversation
  const conversation = await Conversation.findOne({
    _id: new Types.ObjectId(conversationId),
    participants: { $in: [new Types.ObjectId(userId)] }
  });

  if (!conversation) {
    throw new AppError('Conversation not found or you are not a participant', 403);
  }

  // Build the query
  const query: any = { conversationId: new Types.ObjectId(conversationId) };
  
  if (cursor) {
    // Validate cursor format if provided
    if (!Types.ObjectId.isValid(cursor)) {
      throw new AppError('Invalid cursor format', 400);
    }
    query._id = { $lt: new Types.ObjectId(cursor) }; // Get messages older than the cursor
  }

  // Fetch messages with pagination
  const messages = await Message.find(query)
    .populate('senderId', '_id name email')
    .sort({ createdAt: -1 }) // Sort by createdAt descending to get newest first
    .limit(limit);

  // Reverse the order to return messages in chronological order (oldest first)
  return messages.reverse();
};