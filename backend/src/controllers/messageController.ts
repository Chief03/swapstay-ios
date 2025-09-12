import { Request, Response } from 'express';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import User from '../models/User';
import mongoose from 'mongoose';

// Get all conversations for a user
export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'fullName email profilePicture')
    .populate('listingId', 'title propertyType listingType')
    .sort({ lastMessageAt: -1 });
    
    // Get unread counts for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          sender: { $ne: userId },
          read: false
        });
        
        return {
          ...conv.toObject(),
          unreadCount
        };
      })
    );
    
    res.json({
      success: true,
      conversations: conversationsWithUnread
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
};

// Get messages for a specific conversation
export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    // Verify user is part of conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.some(p => p.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this conversation'
      });
    }
    
    const messages = await Message.find({ conversationId })
      .populate('sender', 'fullName email profilePicture')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: userId },
        read: false
      },
      { $set: { read: true, readAt: new Date() } }
    );
    
    res.json({
      success: true,
      messages: messages.reverse(), // Return in chronological order
      page: Number(page),
      hasMore: messages.length === Number(limit)
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// Create or get conversation
export const createConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { recipientId, listingId } = req.body;
    
    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID is required'
      });
    }
    
    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] }
    });
    
    if (conversation) {
      // Return existing conversation
      await conversation.populate('participants', 'fullName email profilePicture');
      await conversation.populate('listingId', 'title propertyType listingType');
      
      return res.json({
        success: true,
        conversation,
        isNew: false
      });
    }
    
    // Create new conversation
    conversation = await Conversation.create({
      participants: [userId, recipientId],
      listingId: listingId || undefined
    });
    
    await conversation.populate('participants', 'fullName email profilePicture');
    await conversation.populate('listingId', 'title propertyType listingType');
    
    res.status(201).json({
      success: true,
      conversation,
      isNew: true
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation'
    });
  }
};

// Send a message (REST endpoint as backup to WebSocket)
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { conversationId } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }
    
    // Verify user is part of conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.some(p => p.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this conversation'
      });
    }
    
    // Create message
    const message = await Message.create({
      conversationId,
      sender: userId,
      content: content.trim(),
      read: false
    });
    
    // Update conversation
    conversation.lastMessage = content.trim();
    conversation.lastMessageAt = new Date();
    await conversation.save();
    
    // Populate sender info
    await message.populate('sender', 'fullName email profilePicture');
    
    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// Mark messages as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { conversationId } = req.params;
    
    // Verify user is part of conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.some(p => p.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this conversation'
      });
    }
    
    // Mark all messages from other user as read
    const result = await Message.updateMany(
      {
        conversationId,
        sender: { $ne: userId },
        read: false
      },
      { $set: { read: true, readAt: new Date() } }
    );
    
    res.json({
      success: true,
      markedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
};

// Get unread message count
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // Get all conversations for user
    const conversations = await Conversation.find({
      participants: userId
    });
    
    // Count unread messages across all conversations
    const unreadCount = await Message.countDocuments({
      conversationId: { $in: conversations.map(c => c._id) },
      sender: { $ne: userId },
      read: false
    });
    
    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
};

// Delete a conversation
export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { conversationId } = req.params;
    
    // Verify user is part of conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.some(p => p.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this conversation'
      });
    }
    
    // Delete all messages in conversation
    await Message.deleteMany({ conversationId });
    
    // Delete conversation
    await conversation.deleteOne();
    
    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete conversation'
    });
  }
};