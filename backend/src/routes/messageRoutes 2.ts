import express from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getConversations,
  getMessages,
  createConversation,
  sendMessage,
  markAsRead,
  getUnreadCount,
  deleteConversation
} from '../controllers/messageController';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Conversation routes
router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.delete('/conversations/:conversationId', deleteConversation);

// Message routes
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', sendMessage);
router.put('/conversations/:conversationId/read', markAsRead);

// Utility routes
router.get('/unread-count', getUnreadCount);

export default router;