import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Platform,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/api';

let SwapstayNative: any = null;
try {
  SwapstayNative = require('../../modules/swapstay-native/src/SwapstayNativeModule').default;
} catch (e) {
  console.log('Native module not available in Expo Go');
}

interface UserProfile {
  name: string;
  email: string;
  university: string;
  avatar: string;
  verified: boolean;
  swapsCompleted: number;
  rating: number;
  memberSince: string;
}

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [isStudentVerified, setIsStudentVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    university: '',
    avatar: 'https://i.pravatar.cc/150?img=8',
    verified: false,
    swapsCompleted: 0,
    rating: 0,
    memberSince: '',
  });

  // Fetch user data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadUserProfile();
    }, [])
  );

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCurrentUser();
      
      if (response.data) {
        const user = response.data;
        
        // Format the name
        const displayName = user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}`
          : user.fullName || 'User';
        
        // Format member since date
        const memberDate = new Date(user.createdAt);
        const memberSince = memberDate.toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        });
        
        setUserProfile({
          name: displayName,
          email: user.email,
          university: user.university,
          avatar: user.profilePicture || 'https://i.pravatar.cc/150?img=8',
          verified: user.emailVerified,
          swapsCompleted: user.swapsCompleted || 0,
          rating: user.rating || 0,
          memberSince: memberSince,
        });
        
        setIsStudentVerified(user.emailVerified);
        
        // Set notification preferences if they exist
        if (user.notifications) {
          setNotificationsEnabled(user.notifications.pushEnabled || false);
          setEmailUpdates(user.notifications.emailUpdates || false);
        }
        
        // Verify with native module if available
        if (SwapstayNative && Platform.OS === 'ios') {
          try {
            const isVerified = await SwapstayNative.verifyStudent(user.email);
            setIsStudentVerified(isVerified);
          } catch (error) {
            console.log('Verification not available in Expo Go');
          }
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserProfile();
  };

  const handleSettingPress = async (setting: string) => {
    if (SwapstayNative && Platform.OS === 'ios') {
      await SwapstayNative.triggerHaptic('light');
    }
    
    switch(setting) {
      case 'editProfile':
        navigation.navigate('EditProfile' as never);
        break;
      case 'verification':
        Alert.alert(
          'Student Verification',
          isStudentVerified 
            ? 'Your student email is verified ✅' 
            : 'Please verify your .edu email'
        );
        break;
      case 'listings':
        Alert.alert('My Listings', 'View and manage your swap listings');
        break;
      case 'savedSwaps':
        Alert.alert('Saved Swaps', 'View your saved swap opportunities');
        break;
      case 'swapHistory':
        Alert.alert('Swap History', `You've completed ${userProfile.swapsCompleted} swaps!`);
        break;
      case 'help':
        Alert.alert('Help & Support', 'Need help? Contact support@swapstay.com');
        break;
      case 'terms':
        Alert.alert('Terms', 'View terms of service');
        break;
      case 'privacy':
        Alert.alert('Privacy', 'View privacy policy');
        break;
      case 'logout':
        Alert.alert(
          'Logout',
          'Are you sure you want to logout?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Logout', 
              style: 'destructive',
              onPress: async () => {
                await apiService.logout();
                // Navigate back to auth screen
                // You might need to reset the navigation stack here
              }
            },
          ]
        );
        break;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
        }
      >
        <View style={[styles.profileHeader, { backgroundColor: theme.colors.surface }]}>
          <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
          <Text style={[styles.userName, { color: theme.colors.onSurface }]}>{userProfile.name}</Text>
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#10b981" />
            <Text style={styles.verifiedText}>Verified Student</Text>
          </View>
          <Text style={[styles.university, { color: theme.colors.onSurfaceVariant }]}>{userProfile.university}</Text>
          
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProfile.swapsCompleted}</Text>
              <Text style={styles.statLabel}>Swaps</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.statValue}>{userProfile.rating}</Text>
              </View>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {userProfile.memberSince ? 
                  userProfile.memberSince.split(' ')[0].slice(0, 3) + ' \'' + 
                  userProfile.memberSince.split(' ')[1]?.slice(2, 4) : 
                  'New'
                }
              </Text>
              <Text style={styles.statLabel}>Joined</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Account</Text>
          
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
            onPress={() => handleSettingPress('editProfile')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-outline" size={22} color={theme.colors.primary} />
              <Text style={[styles.menuItemText, { color: theme.colors.onSurface }]}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleSettingPress('verification')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="school-outline" size={22} color="#6366f1" />
              <Text style={styles.menuItemText}>Student Verification</Text>
            </View>
            {isStudentVerified ? (
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            ) : (
              <Ionicons name="chevron-forward" size={20} color="#999" />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleSettingPress('listings')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="home-outline" size={22} color="#6366f1" />
              <Text style={styles.menuItemText}>My Listings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleSettingPress('savedSwaps')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="bookmark-outline" size={22} color="#6366f1" />
              <Text style={styles.menuItemText}>Saved Swaps</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleSettingPress('swapHistory')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="time-outline" size={22} color="#6366f1" />
              <Text style={styles.menuItemText}>Swap History</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Preferences</Text>
          
          <View style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.menuItemLeft}>
              <Ionicons name={isDarkMode ? "moon" : "moon-outline"} size={22} color={theme.colors.primary} />
              <Text style={[styles.menuItemText, { color: theme.colors.onSurface }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
            />
          </View>
          
          <View style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="notifications-outline" size={22} color={theme.colors.primary} />
              <Text style={[styles.menuItemText, { color: theme.colors.onSurface }]}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
            />
          </View>

          <View style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="mail-outline" size={22} color={theme.colors.primary} />
              <Text style={[styles.menuItemText, { color: theme.colors.onSurface }]}>Email Updates</Text>
            </View>
            <Switch
              value={emailUpdates}
              onValueChange={setEmailUpdates}
              trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleSettingPress('help')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={22} color="#6366f1" />
              <Text style={styles.menuItemText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleSettingPress('terms')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="document-text-outline" size={22} color="#6366f1" />
              <Text style={styles.menuItemText}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleSettingPress('privacy')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="shield-outline" size={22} color="#6366f1" />
              <Text style={styles.menuItemText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => handleSettingPress('logout')}
        >
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>SwapStay v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  profileHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#6366f1',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  verifiedText: {
    fontSize: 12,
    color: '#10b981',
    marginLeft: 4,
    fontWeight: '600',
  },
  university: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 10,
    marginTop: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
    marginHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
});

export default ProfileScreen;