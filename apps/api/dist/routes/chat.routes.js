import { Router } from 'express';
import { createOrFetchConversation, getUserChatConversations, getConversationMessagesController, sendMessageController } from '../controllers/chat.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { csrfMiddleware } from '../middlewares/csrf.middleware.js';
const router = Router();
/**
 * POST /api/chat/conversations
 * Create or fetch a conversation with a user
 */
router.post('/conversations', authMiddleware, csrfMiddleware, createOrFetchConversation);
router.post("/messages", authMiddleware, csrfMiddleware, sendMessageController);
/**
 * GET /api/chat/conversations
 * Get all conversations for the authenticated user
 */
router.get('/conversations', authMiddleware, getUserChatConversations);
/**
 * GET /api/chat/conversations/:conversationId/messages
 * Get messages for a conversation with pagination
 */
router.get('/conversations/:conversationId/messages', authMiddleware, getConversationMessagesController);
export default router;
//# sourceMappingURL=chat.routes.js.map