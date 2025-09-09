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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const ProfileScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [isStudentVerified, setIsStudentVerified] = useState(false);

  const userProfile: UserProfile = {
    name: 'John Doe',
    email: 'john.doe@university.edu',
    university: 'Stanford University',
    avatar: 'https://i.pravatar.cc/150?img=8',
    verified: true,
    swapsCompleted: 12,
    rating: 4.9,
    memberSince: 'September 2023',
  };

  useEffect(() => {
    verifyStudentEmail();
  }, []);

  const verifyStudentEmail = async () => {
    if (SwapstayNative && Platform.OS === 'ios') {
      try {
        const isVerified = await SwapstayNative.verifyStudent(userProfile.email);
        setIsStudentVerified(isVerified);
      } catch (error) {
        console.log('Verification not available in Expo Go');
      }
    }
  };

  const handleSettingPress = async (setting: string) => {
    if (SwapstayNative && Platform.OS === 'ios') {
      await SwapstayNative.triggerHaptic('light');
    }
    
    switch(setting) {
      case 'editProfile':
        Alert.alert('Edit Profile', 'Profile editing coming soon!');
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
            { text: 'Logout', style: 'destructive' },
          ]
        );
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
          <Text style={styles.userName}>{userProfile.name}</Text>
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#10b981" />
            <Text style={styles.verifiedText}>Verified Student</Text>
          </View>
          <Text style={styles.university}>{userProfile.university}</Text>
          
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
              <Text style={styles.statValue}>Sep '23</Text>
              <Text style={styles.statLabel}>Joined</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleSettingPress('editProfile')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-outline" size={22} color="#6366f1" />
              <Text style={styles.menuItemText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="notifications-outline" size={22} color="#6366f1" />
              <Text style={styles.menuItemText}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#e0e0e0', true: '#6366f1' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="mail-outline" size={22} color="#6366f1" />
              <Text style={styles.menuItemText}>Email Updates</Text>
            </View>
            <Switch
              value={emailUpdates}
              onValueChange={setEmailUpdates}
              trackColor={{ false: '#e0e0e0', true: '#6366f1' }}
              thumbColor="#fff"
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
});

export default ProfileScreen;