import { Server, Socket } from 'socket.io';
import { authenticateSocket } from './auth.socket.js';
import { Message } from '../models/message.model.js';
import { Conversation } from '../models/conversation.model.js';
import { getOrCreateConversation } from '../services/chat.service.js';
import { 
  markMessagesDelivered, 
  markMessagesRead, 
  markConversationMessagesRead 
} from '../services/readReceipt.service.js';
import { encryptMessage, decryptMessage } from '../utils/encryption.js';

// Simple in-memory typing state per socket
const typingState = new Map<string, Set<string>>(); // socket.id -> Set of conversationIds

const serializeMessage = (message: any) => ({
  _id: message._id.toString(),
  conversationId: message.conversationId.toString(),
  senderId: message.senderId.toString(),
  content: message.content,
  type: message.type,
  status: message.status,
  createdAt: message.createdAt,
  updatedAt: message.updatedAt,
  clientId: message.clientId,
  clientMessageId: message.clientId,
  attachments: message.attachments,
  metadata: message.metadata
});

/**
 * Setup chat socket event handlers
 */
export const setupChatHandlers = (io: Server, socket: Socket) => {
  // Handle sending a message
  socket.on('message:send', async (data, callback) => {
    try {
      const { conversationId, content, type = 'text', clientId, clientMessageId, attachments } = data;
      const dedupeClientId = clientId || clientMessageId;

      if (!conversationId) {
        if (callback) callback({ success: false, message: 'Conversation ID is required' });
        return;
      }

      // Get the authenticated user from socket data
      const userId = socket.data.user.sub;

      // Check if user is a participant in the conversation
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: { $in: [userId] }
      });

      if (!conversation) {
        if (callback) callback({ success: false, message: 'You are not authorized to send messages to this conversation' });
        return;
      }

      if (dedupeClientId) {
        const existingMessage = await Message.findOne({
          conversationId,
          senderId: userId,
          clientId: dedupeClientId
        });

        if (existingMessage) {
          if (callback) callback({ success: true, message: serializeMessage(existingMessage) });
          return;
        }
      }

      // Determine message type based on attachments
      let messageType = type;
      if (attachments && attachments.length > 0) {
        // If has images, set type to image
        const hasImages = attachments.some((a: any) => a.type?.startsWith('image/'));
        messageType = hasImages ? 'image' : 'file';
      }

      // Encrypt message content before saving
      const encrypted = content ? encryptMessage(content) : { content: '', iv: '' };

      // DEBUG: Log encrypted content (REMOVE AFTER VERIFICATION)
      console.log('🔐 Original content:', content);
      console.log('🔐 Encrypted content:', encrypted.content.substring(0, 50) + '...');
      console.log('🔐 IV:', encrypted.iv);

      // Create the message using the Message model
      const message = new Message({
        conversationId,
        senderId: userId,
        content: encrypted.content,  // Store encrypted content
        iv: encrypted.iv,            // Store IV for decryption
        type: messageType,
        status: 'sent',
        clientId: dedupeClientId,
        attachments: attachments && attachments.length > 0 ? attachments : undefined
      });

      await message.save();

      // DEBUG: Verify what's stored in DB (REMOVE AFTER VERIFICATION)
      const messageContent = message.content || '';
      console.log('💾 Stored in DB - content:', messageContent.substring(0, 50) + '...');
      console.log('💾 Stored in DB - iv:', message.iv || 'N/A');

      // Update the conversation's last message
      await Conversation.updateOne(
        { _id: conversationId },
        { lastMessage: message._id }
      );

      // Decrypt content before emitting to frontend
      const messageObj = message.toObject();
      const decryptedContent = (messageObj.iv && messageObj.content) 
        ? decryptMessage(messageObj.content, messageObj.iv) 
        : (messageObj.content || '');
      
      // DEBUG: Verify decryption (REMOVE AFTER VERIFICATION)
      console.log('🔓 Decrypted content:', decryptedContent);
      
      const payload = {
        ...serializeMessage(message),
        content: decryptedContent  // Send decrypted content to frontend
      };

      // Emit the new message to ALL participants in the conversation room (INCLUDING sender)
      // This ensures sender's optimistic message gets replaced with real message from server
      io.to(`conversation:${conversationId}`).emit('message:new', payload);

      // Acknowledge the sender
      if (callback) callback({ success: true, message: payload });
    } catch (error: any) {
      console.error('Error sending message:', error);
      if (callback) callback({ success: false, message: error.message || 'Failed to send message' });
    }
  });

  // Handle message delivered - when recipient receives the message
  socket.on('message:delivered', async (data) => {
    try {
      const { messageIds, conversationId } = data;
      
      if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
        return; // Silently ignore invalid data
      }

      if (!conversationId) {
        return; // Silently ignore if no conversation ID
      }

      // Get the authenticated user from socket data
      const userId = socket.data.user.sub;

      // Check if user is a participant in the conversation
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: { $in: [userId] }
      });

      if (!conversation) {
        return; // Silently ignore if not authorized
      }

      // Mark messages as delivered
      await markMessagesDelivered(messageIds, userId);

      // Emit status update to the conversation room
      socket.to(`conversation:${conversationId}`).emit('message:status', {
        messageIds,
        status: 'delivered'
      });
    } catch (error) {
      console.error('Error handling message delivered:', error);
      // Silently ignore errors to prevent crashes
    }
  });

  // Handle message read - when recipient reads the messages
  socket.on('message:read', async (data) => {
    try {
      const { messageIds, conversationId } = data;

      if (!conversationId) {
        return; // Silently ignore if no conversation ID
      }

      // Get the authenticated user from socket data
      const userId = socket.data.user.sub;

      // Check if user is a participant in the conversation
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: { $in: [userId] }
      });

      if (!conversation) {
        return; // Silently ignore if not authorized
      }

      // If messageIds is provided, mark specific messages as read
      if (messageIds && Array.isArray(messageIds) && messageIds.length > 0) {
        await markMessagesRead(messageIds, userId, conversationId);
        
        // Emit status update to the conversation room
        socket.to(`conversation:${conversationId}`).emit('message:status', {
          messageIds,
          status: 'read'
        });
      } else {
        // Mark all messages in the conversation as read
        await markConversationMessagesRead(conversationId, userId);
        
        // Emit status update to the conversation room
        socket.to(`conversation:${conversationId}`).emit('message:status', {
          conversationId,
          status: 'read-all'
        });
      }
    } catch (error) {
      console.error('Error handling message read:', error);
      // Silently ignore errors to prevent crashes
    }
  });

  // Handle typing start
  socket.on('typing:start', async (data) => {
    try {
      const { conversationId } = data;

      if (!conversationId) {
        return;
      }

      // Get the authenticated user from socket data
      const userId = socket.data.user.sub;

      // Check if user is a participant in the conversation
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: { $in: [userId] }
      });

      if (!conversation) {
        return; // Silently ignore if not authorized
      }

      // Initialize typing state for this socket if not exists
      if (!typingState.has(socket.id)) {
        typingState.set(socket.id, new Set());
      }

      const userTypingConversations = typingState.get(socket.id)!;
      
      // If already typing in this conversation, ignore duplicate
      if (userTypingConversations.has(conversationId)) {
        return;
      }

      // Mark this conversation as being typed in
      userTypingConversations.add(conversationId);

      // Emit typing start to other participants in the conversation
      socket.to(`conversation:${conversationId}`).emit('typing:status', {
        userId,
        conversationId,
        typing: true
      });
    } catch (error) {
      console.error('Error handling typing start:', error);
      // Silently ignore typing errors to prevent crashes
    }
  });

  // Handle typing stop
  socket.on('typing:stop', async (data) => {
    try {
      const { conversationId } = data;

      if (!conversationId) {
        return;
      }

      // Get the authenticated user from socket data
      const userId = socket.data.user.sub;

      // Check if user is a participant in the conversation
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: { $in: [userId] }
      });

      if (!conversation) {
        return; // Silently ignore if not authorized
      }

      // Remove from typing state
      if (typingState.has(socket.id)) {
        const userTypingConversations = typingState.get(socket.id)!;
        userTypingConversations.delete(conversationId);
      }

      // Emit typing stop to other participants in the conversation
      socket.to(`conversation:${conversationId}`).emit('typing:status', {
        userId,
        conversationId,
        typing: false
      });
    } catch (error) {
      console.error('Error handling typing stop:', error);
      // Silently ignore typing errors to prevent crashes
    }
  });

  // Handle socket disconnect - stop all typing indicators for this user
  socket.on('disconnect', () => {
    // Clear typing state for this socket
    if (typingState.has(socket.id)) {
      const userTypingConversations = typingState.get(socket.id)!;
      
      // For each conversation this user was typing in, emit typing:stop
      for (const conversationId of userTypingConversations) {
        // Get the user ID from socket data
        const userId = socket.data.user.sub;
        
        // Emit typing stop to other participants in each conversation
        socket.to(`conversation:${conversationId}`).emit('typing:status', {
          userId,
          conversationId,
          typing: false
        });
      }
      
      // Remove from typing state
      typingState.delete(socket.id);
    }
  });

  // Handle leaving a conversation - stop typing in that conversation
  socket.on('conversation:leave', (conversationId) => {
    // Remove from typing state for this conversation
    if (typingState.has(socket.id)) {
      const userTypingConversations = typingState.get(socket.id)!;
      userTypingConversations.delete(conversationId);
    }
  });
};
