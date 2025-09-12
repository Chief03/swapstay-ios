import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/api';
import messagingService, { Message } from '../services/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RouteParams {
  conversationId?: string;
  recipient?: any;
  listing?: any;
}

const ChatScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const params = route.params as RouteParams;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [conversationId, setConversationId] = useState<string | undefined>(params.conversationId);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const typingTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadUserData();
    
    if (conversationId) {
      loadMessages();
      messagingService.joinConversation(conversationId);
    } else if (params.recipient) {
      // Create new conversation if needed
      createConversation();
    }

    // Subscribe to new messages
    const unsubscribeMessage = messagingService.onNewMessage((message) => {
      if (message.conversationId === conversationId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    });

    // Subscribe to typing indicators
    const unsubscribeTyping = messagingService.onTyping((data) => {
      if (data.conversationId === conversationId && data.userId !== currentUserId) {
        setOtherUserTyping(data.isTyping);
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
      if (conversationId) {
        messagingService.stopTyping(conversationId);
      }
    };
  }, [conversationId]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUserId(user._id);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const createConversation = async () => {
    try {
      const response = await apiService.createConversation(
        params.recipient._id,
        params.listing?._id
      );
      
      if (response.success && response.conversation) {
        setConversationId(response.conversation._id);
        messagingService.joinConversation(response.conversation._id);
        
        if (!response.isNew) {
          loadMessages(response.conversation._id);
        }
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Error', 'Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId?: string) => {
    try {
      const id = convId || conversationId;
      if (!id) return;
      
      const response = await apiService.getMessages(id);
      if (response.success) {
        setMessages(response.messages || []);
        
        // Mark messages as read
        await apiService.markMessagesAsRead(id);
        
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || sending) return;
    
    const messageContent = inputText.trim();
    setInputText('');
    setSending(true);
    
    try {
      if (conversationId) {
        // Send via WebSocket for real-time delivery
        messagingService.sendMessage({
          conversationId,
          content: messageContent
        });
      } else if (params.recipient) {
        // Create conversation and send first message
        messagingService.sendMessage({
          recipientId: params.recipient._id,
          content: messageContent,
          listingId: params.listing?._id
        });
      }
      
      stopTyping();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      setInputText(messageContent); // Restore input on error
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (text: string) => {
    setInputText(text);
    
    if (!conversationId) return;
    
    // Start typing indicator
    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      messagingService.startTyping(conversationId);
    }
    
    // Clear existing timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    
    // Set new timeout to stop typing
    if (text.length > 0) {
      typingTimeout.current = setTimeout(() => {
        stopTyping();
      }, 2000);
    } else {
      stopTyping();
    }
  };

  const stopTyping = () => {
    if (isTyping && conversationId) {
      setIsTyping(false);
      messagingService.stopTyping(conversationId);
    }
    
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender._id === currentUserId;
    
    return (
      <View style={[
        styles.messageWrapper,
        isOwnMessage ? styles.ownMessageWrapper : styles.otherMessageWrapper
      ]}>
        {!isOwnMessage && (
          <View style={styles.avatarContainer}>
            {item.sender.profilePicture ? (
              <Image 
                source={{ uri: item.sender.profilePicture }} 
                style={styles.avatar} 
              />
            ) : (
              <View style={[styles.avatarPlaceholder, isDarkMode && styles.avatarPlaceholderDark]}>
                <Text style={styles.avatarText}>
                  {item.sender.fullName?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
          isDarkMode && (isOwnMessage ? styles.ownMessageDark : styles.otherMessageDark)
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
            isDarkMode && styles.messageTextDark
          ]}>
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
            ]}>
              {formatTime(item.createdAt)}
            </Text>
            {isOwnMessage && item.read && (
              <Ionicons name="checkmark-done" size={14} color="#a0a0a0" style={styles.readIcon} />
            )}
          </View>
        </View>
      </View>
    );
  };

  const recipient = params.recipient;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#e2e8f0' : '#333'} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>
            {recipient?.fullName || recipient?.email || 'Chat'}
          </Text>
          {otherUserTyping && (
            <Text style={styles.typingIndicator}>typing...</Text>
          )}
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color={isDarkMode ? '#e2e8f0' : '#333'} />
        </TouchableOpacity>
      </View>

      {/* Listing Info (if applicable) */}
      {params.listing && (
        <TouchableOpacity 
          style={[styles.listingInfo, isDarkMode && styles.listingInfoDark]}
          onPress={() => navigation.navigate('ListingDetail', { listing: params.listing })}
        >
          <Ionicons name="home-outline" size={16} color="#6366f1" />
          <Text style={[styles.listingText, isDarkMode && styles.listingTextDark]}>
            Regarding: {params.listing.title}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#999" />
        </TouchableOpacity>
      )}

      {/* Messages List */}
      <KeyboardAvoidingView 
        style={styles.messagesContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={scrollToBottom}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>

      {/* Input Area */}
      <View style={[styles.inputContainer, isDarkMode && styles.inputContainerDark]}>
        <View style={[styles.inputWrapper, isDarkMode && styles.inputWrapperDark]}>
          <TextInput
            style={[styles.textInput, isDarkMode && styles.textInputDark]}
            placeholder="Type a message..."
            placeholderTextColor={isDarkMode ? '#64748b' : '#999'}
            value={inputText}
            onChangeText={handleTyping}
            multiline
            maxLength={1000}
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!inputText.trim() || sending) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerDark: {
    backgroundColor: '#1e293b',
    borderBottomColor: '#334155',
  },
  backButton: {
    padding: 5,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerTitleDark: {
    color: '#e2e8f0',
  },
  typingIndicator: {
    fontSize: 13,
    color: '#6366f1',
    fontStyle: 'italic',
  },
  moreButton: {
    padding: 5,
  },
  listingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f0f9ff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0f2fe',
  },
  listingInfoDark: {
    backgroundColor: '#1e293b',
    borderBottomColor: '#334155',
  },
  listingText: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 14,
    color: '#333',
  },
  listingTextDark: {
    color: '#e2e8f0',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  ownMessageWrapper: {
    justifyContent: 'flex-end',
  },
  otherMessageWrapper: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    marginTop: 2,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderDark: {
    backgroundColor: '#818cf8',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  ownMessage: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  ownMessageDark: {
    backgroundColor: '#4f46e5',
  },
  otherMessage: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  otherMessageDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTextDark: {
    color: '#e2e8f0',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  ownMessageTime: {
    color: '#e0e7ff',
  },
  otherMessageTime: {
    color: '#999',
  },
  readIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
  },
  inputContainerDark: {
    backgroundColor: '#1e293b',
    borderTopColor: '#334155',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  inputWrapperDark: {
    backgroundColor: '#334155',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    paddingTop: 0,
    paddingBottom: 0,
  },
  textInputDark: {
    color: '#e2e8f0',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;