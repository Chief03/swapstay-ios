import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/api';
import messagingService, { Conversation } from '../services/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

let SwapstayNative: any = null;
try {
  SwapstayNative = require('../../modules/swapstay-native/src/SwapstayNativeModule').default;
} catch (e) {
  console.log('Native module not available in Expo Go');
}

const MessagesScreen = () => {
  const navigation = useNavigation<any>();
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    loadUserData();
    loadConversations();
    initializeMessaging();

    // Subscribe to new messages
    const unsubscribe = messagingService.onNotification((data) => {
      // Refresh conversations when new message arrives
      loadConversations();
    });

    return () => {
      unsubscribe();
    };
  }, []);

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

  const initializeMessaging = async () => {
    try {
      await messagingService.initialize();
    } catch (error) {
      console.error('Error initializing messaging:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await apiService.getConversations();
      if (response.success) {
        setConversations(response.conversations || []);
        
        // Calculate total unread count
        const totalUnread = response.conversations?.reduce(
          (sum: number, conv: Conversation) => sum + (conv.unreadCount || 0),
          0
        ) || 0;
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const handleConversationPress = async (conversation: Conversation) => {
    if (SwapstayNative && Platform.OS === 'ios') {
      await SwapstayNative.triggerHaptic('light');
    }

    // Navigate to chat screen
    navigation.navigate('Chat', { 
      conversationId: conversation._id,
      recipient: conversation.participants.find(p => p._id !== currentUserId),
      listing: conversation.listingId
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const otherUser = item.participants.find(p => p._id !== currentUserId);
    if (!otherUser) return null;

    return (
      <TouchableOpacity 
        style={[
          styles.messageCard,
          isDarkMode && styles.messageCardDark
        ]}
        onPress={() => handleConversationPress(item)}
      >
        <View style={styles.avatarContainer}>
          {otherUser.profilePicture ? (
            <Image source={{ uri: otherUser.profilePicture }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, isDarkMode && styles.avatarPlaceholderDark]}>
              <Text style={styles.avatarText}>
                {otherUser.fullName?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
          {item.unreadCount > 0 && <View style={styles.unreadDot} />}
        </View>
        
        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <View style={styles.userInfo}>
              <Text style={[
                styles.userName,
                item.unreadCount > 0 && styles.unreadText,
                isDarkMode && styles.userNameDark
              ]}>
                {otherUser.fullName || otherUser.email}
              </Text>
              <Ionicons name="shield-checkmark" size={14} color="#10b981" />
            </View>
            <Text style={[styles.timestamp, isDarkMode && styles.timestampDark]}>
              {item.lastMessageAt ? formatTimestamp(item.lastMessageAt) : ''}
            </Text>
          </View>
          
          {item.listingId && (
            <Text style={styles.listingTitle}>
              {item.listingId.title}
            </Text>
          )}
          
          <Text 
            style={[
              styles.lastMessage,
              item.unreadCount > 0 && styles.unreadText,
              isDarkMode && styles.lastMessageDark
            ]} 
            numberOfLines={1}
          >
            {item.lastMessage || 'Start a conversation'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    
    const otherUser = conv.participants.find(p => p._id !== currentUserId);
    if (!otherUser) return false;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      otherUser.fullName?.toLowerCase().includes(searchLower) ||
      otherUser.email.toLowerCase().includes(searchLower) ||
      conv.lastMessage?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={[styles.loadingText, isDarkMode && styles.loadingTextDark]}>
            Loading conversations...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]} edges={['bottom']}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <View style={[styles.searchContainer, isDarkMode && styles.searchContainerDark]}>
          <Ionicons name="search" size={20} color={isDarkMode ? '#999' : '#666'} />
          <TextInput
            style={[styles.searchInput, isDarkMode && styles.searchInputDark]}
            placeholder="Search conversations..."
            placeholderTextColor={isDarkMode ? '#999' : '#999'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>
              {unreadCount} new message{unreadCount > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {filteredConversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name="chatbubbles-outline" 
            size={64} 
            color={isDarkMode ? '#666' : '#ccc'} 
          />
          <Text style={[styles.emptyTitle, isDarkMode && styles.emptyTitleDark]}>
            No conversations yet
          </Text>
          <Text style={[styles.emptyText, isDarkMode && styles.emptyTextDark]}>
            Start messaging other students about their listings
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6366f1"
            />
          }
        />
      )}
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
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerDark: {
    backgroundColor: '#1e293b',
    borderBottomColor: '#334155',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchContainerDark: {
    backgroundColor: '#334155',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  searchInputDark: {
    color: '#e2e8f0',
  },
  unreadBadge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  messagesList: {
    paddingVertical: 10,
  },
  messageCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 5,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  messageCardDark: {
    backgroundColor: '#1e293b',
    shadowOpacity: 0.2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderDark: {
    backgroundColor: '#818cf8',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366f1',
    borderWidth: 2,
    borderColor: '#fff',
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userNameDark: {
    color: '#e2e8f0',
  },
  unreadText: {
    fontWeight: '700',
    color: '#1a1a1a',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  timestampDark: {
    color: '#94a3b8',
  },
  listingTitle: {
    fontSize: 13,
    color: '#6366f1',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  lastMessageDark: {
    color: '#94a3b8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  loadingTextDark: {
    color: '#94a3b8',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyTitleDark: {
    color: '#e2e8f0',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyTextDark: {
    color: '#94a3b8',
  },
});

export default MessagesScreen;