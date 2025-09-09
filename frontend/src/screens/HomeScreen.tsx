import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our native Swift module
// This will be available after building with EAS Build
let SwapstayNative: any = null;
try {
  SwapstayNative = require('../../modules/swapstay-native/src/SwapstayNativeModule').default;
} catch (e) {
  console.log('Native module not available in Expo Go');
}

interface Listing {
  id: string;
  title: string;
  location: string;
  university: string;
  image: string;
  rating: number;
  dates: string;
}

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    // Use native Swift module if available
    if (SwapstayNative && Platform.OS === 'ios') {
      SwapstayNative.getDeviceInfo().then(setDeviceInfo).catch(console.error);
    }
  }, []);

  const handleSearch = async () => {
    // Trigger native haptic feedback on iOS
    if (SwapstayNative && Platform.OS === 'ios') {
      await SwapstayNative.triggerHaptic('light');
    }
  };

  const featuredListings: Listing[] = [
    {
      id: '1',
      title: 'Cozy Studio Near NYU',
      location: 'Greenwich Village, NYC',
      university: 'New York University',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
      rating: 4.8,
      dates: 'Jun 1 - Aug 15',
    },
    {
      id: '2',
      title: 'Modern Apt by UCLA',
      location: 'Westwood, LA',
      university: 'UCLA',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
      rating: 4.9,
      dates: 'May 15 - Jul 30',
    },
    {
      id: '3',
      title: 'MIT Area House',
      location: 'Cambridge, MA',
      university: 'MIT',
      image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400',
      rating: 4.7,
      dates: 'Jun 10 - Aug 20',
    },
  ];

  const renderListing = ({ item }: { item: Listing }) => (
    <TouchableOpacity style={styles.listingCard}>
      <Image source={{ uri: item.image }} style={styles.listingImage} />
      <View style={styles.listingContent}>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <Text style={styles.listingTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        <Text style={styles.universityText}>{item.university}</Text>
        <Text style={styles.dateText}>{item.dates}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Swap Your College Home</Text>
          <Text style={styles.heroSubtitle}>
            Connect with verified students nationwide
          </Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Where do you want to go?"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="add-circle-outline" size={24} color="#6366f1" />
              <Text style={styles.actionText}>List Space</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#6366f1" />
              <Text style={styles.actionText}>Verified</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="help-circle-outline" size={24} color="#6366f1" />
              <Text style={styles.actionText}>How It Works</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Native Module Info (Debug) */}
        {deviceInfo && (
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>
              Running on {deviceInfo.model} - iOS {deviceInfo.version}
            </Text>
            <Text style={styles.debugText}>Native Swift Module Active ✅</Text>
          </View>
        )}

        {/* Featured Listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Swaps</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={featuredListings}
            renderItem={renderListing}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listingsContainer}
          />
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why SwapStay?</Text>
          <View style={styles.features}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name="shield" size={24} color="#6366f1" />
              </View>
              <Text style={styles.featureTitle}>Verified Students</Text>
              <Text style={styles.featureDesc}>All users verified with .edu emails</Text>
            </View>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name="people" size={24} color="#6366f1" />
              </View>
              <Text style={styles.featureTitle}>Perfect Matches</Text>
              <Text style={styles.featureDesc}>Find compatible swaps easily</Text>
            </View>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name="calendar" size={24} color="#6366f1" />
              </View>
              <Text style={styles.featureTitle}>Flexible Timing</Text>
              <Text style={styles.featureDesc}>Swap for any duration you need</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  hero: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 10,
  },
  actionText: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
  debugInfo: {
    margin: 20,
    padding: 15,
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
  },
  debugText: {
    fontSize: 12,
    color: '#2e7d32',
    marginBottom: 5,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  seeAll: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  listingsContainer: {
    paddingRight: 20,
  },
  listingCard: {
    width: 280,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  listingImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  listingContent: {
    padding: 15,
  },
  ratingBadge: {
    position: 'absolute',
    top: -20,
    right: 15,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  universityText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 13,
    color: '#999',
  },
  featuresSection: {
    padding: 20,
  },
  features: {
    marginTop: 15,
  },
  feature: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f1ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: '#666',
    position: 'absolute',
    bottom: 15,
    left: 80,
  },
});

export default HomeScreen;