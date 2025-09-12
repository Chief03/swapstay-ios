import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import User from '../models/User';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

class SocketHandler {
  private io: Server;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(io: Server) {
    this.io = io;
    this.initializeSocketHandlers();
  }

  private initializeSocketHandlers() {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication failed'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        socket.userId = decoded.id;
        socket.userEmail = decoded.email;
        
        console.log(`🔌 User ${decoded.email} authenticated via WebSocket`);
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`✅ User ${socket.userEmail} connected (${socket.id})`);
      
      if (socket.userId) {
        // Store user's socket ID for direct messaging
        this.userSockets.set(socket.userId, socket.id);
        
        // Join user's own room for direct messages
        socket.join(`user:${socket.userId}`);
        
        // Send online status to user's contacts
        this.notifyOnlineStatus(socket.userId, true);
      }

      // Handle joining conversation rooms
      socket.on('join_conversation', async (conversationId: string) => {
        try {
          // Verify user is part of this conversation
          const conversation = await Conversation.findById(conversationId);
          if (!conversation || !conversation.participants.some(p => p.toString() === socket.userId)) {
            socket.emit('error', { message: 'Unauthorized to join this conversation' });
            return;
          }
          
          socket.join(`conversation:${conversationId}`);
          console.log(`User ${socket.userEmail} joined conversation ${conversationId}`);
          
          // Mark messages as read
          await Message.updateMany(
            {
              conversationId,
              sender: { $ne: socket.userId },
              read: false
            },
            { $set: { read: true, readAt: new Date() } }
          );
          
          // Notify sender that messages were read
          socket.to(`conversation:${conversationId}`).emit('messages_read', {
            conversationId,
            readBy: socket.userId
          });
        } catch (error) {
          console.error('Error joining conversation:', error);
          socket.emit('error', { message: 'Failed to join conversation' });
        }
      });

      // Handle sending messages
      socket.on('send_message', async (data: {
        conversationId?: string;
        recipientId?: string;
        content: string;
        listingId?: string;
      }) => {
        try {
          let conversation;
          
          // Find or create conversation
          if (data.conversationId) {
            conversation = await Conversation.findById(data.conversationId);
          } else if (data.recipientId) {
            // Check if conversation exists between users
            conversation = await Conversation.findOne({
              participants: { $all: [socket.userId, data.recipientId] }
            });
            
            if (!conversation) {
              // Create new conversation
              conversation = await Conversation.create({
                participants: [socket.userId, data.recipientId],
                listingId: data.listingId,
                lastMessage: data.content,
                lastMessageAt: new Date()
              });
            }
          }
          
          if (!conversation) {
            socket.emit('error', { message: 'Conversation not found' });
            return;
          }
          
          // Create message
          const message = await Message.create({
            conversationId: conversation._id,
            sender: socket.userId,
            content: data.content,
            read: false
          });
          
          // Update conversation
          conversation.lastMessage = data.content;
          conversation.lastMessageAt = new Date();
          conversation.unreadCount = await Message.countDocuments({
            conversationId: conversation._id,
            sender: { $ne: socket.userId },
            read: false
          });
          await conversation.save();
          
          // Populate sender info
          const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'fullName email profilePicture');
          
          // Send message to conversation participants
          this.io.to(`conversation:${conversation._id}`).emit('new_message', {
            message: populatedMessage,
            conversation: {
              _id: conversation._id,
              lastMessage: conversation.lastMessage,
              lastMessageAt: conversation.lastMessageAt,
              unreadCount: conversation.unreadCount
            }
          });
          
          // Send notification to recipient if not in conversation room
          const recipientId = conversation.participants.find(p => p.toString() !== socket.userId);
          if (recipientId) {
            const recipientSocketId = this.userSockets.get(recipientId.toString());
            if (recipientSocketId) {
              this.io.to(recipientSocketId).emit('message_notification', {
                conversationId: conversation._id,
                message: populatedMessage,
                unreadCount: conversation.unreadCount
              });
            }
          }
          
          console.log(`📨 Message sent from ${socket.userEmail} in conversation ${conversation._id}`);
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing_start', (data: { conversationId: string }) => {
        socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
          conversationId: data.conversationId,
          userId: socket.userId,
          isTyping: true
        });
      });

      socket.on('typing_stop', (data: { conversationId: string }) => {
        socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
          conversationId: data.conversationId,
          userId: socket.userId,
          isTyping: false
        });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`❌ User ${socket.userEmail} disconnected`);
        
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
          this.notifyOnlineStatus(socket.userId, false);
        }
      });
    });
  }

  private async notifyOnlineStatus(userId: string, isOnline: boolean) {
    try {
      // Get user's conversations to notify participants
      const conversations = await Conversation.find({
        participants: userId
      });
      
      for (const conversation of conversations) {
        const otherParticipants = conversation.participants.filter(
          p => p.toString() !== userId
        );
        
        for (const participantId of otherParticipants) {
          const socketId = this.userSockets.get(participantId.toString());
          if (socketId) {
            this.io.to(socketId).emit('user_status_change', {
              userId,
              isOnline
            });
          }
        }
      }
    } catch (error) {
      console.error('Error notifying online status:', error);
    }
  }
}

export default SocketHandler;