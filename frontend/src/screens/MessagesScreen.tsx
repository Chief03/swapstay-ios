import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

let SwapstayNative: any = null;
try {
  SwapstayNative = require('../../modules/swapstay-native/src/SwapstayNativeModule').default;
} catch (e) {
  console.log('Native module not available in Expo Go');
}

interface Message {
  id: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  university: string;
  verified: boolean;
}

const MessagesScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const messages: Message[] = [
    {
      id: '1',
      userName: 'Alex Chen',
      userAvatar: 'https://i.pravatar.cc/150?img=1',
      lastMessage: 'Hey! Is your place still available for the summer?',
      timestamp: '2 min ago',
      unread: true,
      university: 'Stanford University',
      verified: true,
    },
    {
      id: '2',
      userName: 'Sarah Johnson',
      userAvatar: 'https://i.pravatar.cc/150?img=2',
      lastMessage: 'That sounds perfect! When can we schedule a video call?',
      timestamp: '1 hour ago',
      unread: true,
      university: 'NYU',
      verified: true,
    },
    {
      id: '3',
      userName: 'Mike Williams',
      userAvatar: 'https://i.pravatar.cc/150?img=3',
      lastMessage: "I've sent you the details about my apartment",
      timestamp: '3 hours ago',
      unread: false,
      university: 'MIT',
      verified: true,
    },
    {
      id: '4',
      userName: 'Emily Davis',
      userAvatar: 'https://i.pravatar.cc/150?img=4',
      lastMessage: 'Thanks for the swap! Everything was great 👍',
      timestamp: '1 day ago',
      unread: false,
      university: 'Harvard',
      verified: true,
    },
    {
      id: '5',
      userName: 'James Wilson',
      userAvatar: 'https://i.pravatar.cc/150?img=5',
      lastMessage: 'Can you send more photos of the living room?',
      timestamp: '2 days ago',
      unread: false,
      university: 'UCLA',
      verified: false,
    },
  ];

  const handleMessagePress = async (message: Message) => {
    if (SwapstayNative && Platform.OS === 'ios') {
      await SwapstayNative.triggerHaptic('light');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <TouchableOpacity 
      style={styles.messageCard}
      onPress={() => handleMessagePress(item)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
        {item.unread && <View style={styles.unreadDot} />}
      </View>
      
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, item.unread && styles.unreadText]}>
              {item.userName}
            </Text>
            {item.verified && (
              <Ionicons name="shield-checkmark" size={14} color="#10b981" />
            )}
          </View>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        
        <Text style={styles.university}>{item.university}</Text>
        <Text 
          style={[styles.lastMessage, item.unread && styles.unreadText]} 
          numberOfLines={1}
        >
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const unreadCount = messages.filter(m => m.unread).length;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor="#999"
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

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.fab}>
        <Ionicons name="create-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
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
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  unreadText: {
    fontWeight: '700',
    color: '#1a1a1a',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  university: {
    fontSize: 13,
    color: '#6366f1',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default MessagesScreen;