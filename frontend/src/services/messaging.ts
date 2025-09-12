import io, { Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './api';

interface Message {
  _id: string;
  conversationId: string;
  sender: {
    _id: string;
    fullName: string;
    email: string;
    profilePicture?: string;
  };
  content: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    fullName: string;
    email: string;
    profilePicture?: string;
  }>;
  listingId?: {
    _id: string;
    title: string;
    propertyType: string;
    listingType: string;
  };
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

class MessagingService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private messageHandlers: Set<(message: Message) => void> = new Set();
  private typingHandlers: Set<(data: any) => void> = new Set();
  private statusHandlers: Set<(data: any) => void> = new Set();
  private notificationHandlers: Set<(data: any) => void> = new Set();

  async initialize() {
    try {
      this.token = await AsyncStorage.getItem('authToken');
      if (!this.token) {
        console.error('No auth token found');
        return;
      }

      const socketUrl = API_URL.replace('/api/v1', '');
      
      this.socket = io(socketUrl, {
        auth: {
          token: this.token
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.setupEventListeners();
      
      console.log('🔌 Initializing WebSocket connection...');
    } catch (error) {
      console.error('Failed to initialize messaging service:', error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Connected to messaging server');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from messaging server');
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    // Handle new messages
    this.socket.on('new_message', (data: { message: Message, conversation: any }) => {
      this.messageHandlers.forEach(handler => handler(data.message));
    });

    // Handle message notifications
    this.socket.on('message_notification', (data: any) => {
      this.notificationHandlers.forEach(handler => handler(data));
    });

    // Handle typing indicators
    this.socket.on('user_typing', (data: any) => {
      this.typingHandlers.forEach(handler => handler(data));
    });

    // Handle user status changes
    this.socket.on('user_status_change', (data: any) => {
      this.statusHandlers.forEach(handler => handler(data));
    });

    // Handle read receipts
    this.socket.on('messages_read', (data: any) => {
      // Update local message state to show as read
      console.log('Messages read:', data);
    });
  }

  joinConversation(conversationId: string) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }
    
    this.socket.emit('join_conversation', conversationId);
  }

  sendMessage(data: {
    conversationId?: string;
    recipientId?: string;
    content: string;
    listingId?: string;
  }) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }
    
    this.socket.emit('send_message', data);
  }

  startTyping(conversationId: string) {
    if (!this.socket) return;
    this.socket.emit('typing_start', { conversationId });
  }

  stopTyping(conversationId: string) {
    if (!this.socket) return;
    this.socket.emit('typing_stop', { conversationId });
  }

  // Event subscription methods
  onNewMessage(handler: (message: Message) => void) {
    this.messageHandlers.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  onTyping(handler: (data: any) => void) {
    this.typingHandlers.add(handler);
    
    return () => {
      this.typingHandlers.delete(handler);
    };
  }

  onStatusChange(handler: (data: any) => void) {
    this.statusHandlers.add(handler);
    
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  onNotification(handler: (data: any) => void) {
    this.notificationHandlers.add(handler);
    
    return () => {
      this.notificationHandlers.delete(handler);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    // Clear all handlers
    this.messageHandlers.clear();
    this.typingHandlers.clear();
    this.statusHandlers.clear();
    this.notificationHandlers.clear();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Create singleton instance
const messagingService = new MessagingService();

export default messagingService;
export type { Message, Conversation };