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
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import apiService from '../services/api';

// Import our native Swift module
let SwapstayNative: any = null;
try {
  SwapstayNative = require('../../modules/swapstay-native/src/SwapstayNativeModule').default;
} catch (e) {
  console.log('Native module not available in Expo Go');
}

interface Listing {
  _id: string;
  title: string;
  description: string;
  address: {
    city: string;
    state: string;
  };
  nearUniversity: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  rentPrice?: number;
  listingType: string;
  availableFrom: string;
  availableTo: string;
  photos: any[];
  owner: {
    fullName: string;
    university: string;
    profilePicture?: string;
  };
  views: number;
  favorites: number;
}

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  useEffect(() => {
    loadListings();
    loadFeaturedListings();
    
    // Use native Swift module if available
    if (SwapstayNative && Platform.OS === 'ios') {
      SwapstayNative.getDeviceInfo().catch(console.error);
    }
  }, []);

  const loadListings = async () => {
    try {
      const response = await apiService.getListings({ limit: 10 });
      if (response.success) {
        setListings(response.listings);
      }
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFeaturedListings = async () => {
    try {
      const response = await apiService.getFeaturedListings();
      if (response.success) {
        setFeaturedListings(response.listings);
      }
    } catch (error) {
      console.error('Error loading featured listings:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadListings(), loadFeaturedListings()]);
    setIsRefreshing(false);
  };

  const handleSearch = async () => {
    // Trigger native haptic feedback on iOS
    if (SwapstayNative && Platform.OS === 'ios') {
      await SwapstayNative.triggerHaptic('light');
    }
    
    if (searchQuery.trim()) {
      navigation.navigate('Search', { query: searchQuery });
    }
  };

  const handleFilterPress = (filter: string) => {
    setSelectedFilter(filter === selectedFilter ? null : filter);
    // Apply filter logic here
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPropertyIcon = (type: string) => {
    switch (type) {
      case 'APARTMENT': return 'home-city';
      case 'HOUSE': return 'home';
      case 'DORM': return 'domain';
      case 'STUDIO': return 'home-floor-0';
      case 'CONDO': return 'home-modern';
      case 'TOWNHOUSE': return 'home-group';
      default: return 'home';
    }
  };

  const getListingTypeColor = (type: string) => {
    switch (type) {
      case 'BOTH': return '#667eea';
      case 'SWAP_ONLY': return '#27ae60';
      case 'RENT_ONLY': return '#e74c3c';
      default: return '#666';
    }
  };

  const renderListingCard = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      style={styles.listingCard}
      onPress={() => navigation.navigate('ListingDetail', { listingId: item._id })}
      activeOpacity={0.8}
    >
      {item.photos && item.photos.length > 0 ? (
        <Image source={{ uri: item.photos[0].url }} style={styles.listingImage} />
      ) : (
        <View style={[styles.listingImage, styles.placeholderImage]}>
          <MaterialCommunityIcons 
            name={getPropertyIcon(item.propertyType) as any} 
            size={50} 
            color="#ccc" 
          />
        </View>
      )}
      
      <View style={styles.listingBadge}>
        <Text style={[styles.listingBadgeText, { backgroundColor: getListingTypeColor(item.listingType) }]}>
          {item.listingType === 'BOTH' ? 'Swap or Rent' : 
           item.listingType === 'SWAP_ONLY' ? 'Swap Only' : 'Rent Only'}
        </Text>
      </View>
      
      <View style={styles.listingContent}>
        <Text style={styles.listingTitle} numberOfLines={1}>
          {item.title}
        </Text>
        
        <View style={styles.listingLocation}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.listingLocationText} numberOfLines={1}>
            {item.address.city}, {item.address.state} • {item.nearUniversity}
          </Text>
        </View>
        
        <View style={styles.listingDetails}>
          <View style={styles.listingDetailItem}>
            <Ionicons name="bed-outline" size={16} color="#666" />
            <Text style={styles.listingDetailText}>{item.bedrooms} bed</Text>
          </View>
          <View style={styles.listingDetailItem}>
            <MaterialCommunityIcons name="shower" size={16} color="#666" />
            <Text style={styles.listingDetailText}>{item.bathrooms} bath</Text>
          </View>
          {item.rentPrice && (
            <View style={styles.listingDetailItem}>
              <Text style={styles.listingPrice}>${item.rentPrice}/mo</Text>
            </View>
          )}
        </View>
        
        <View style={styles.listingDates}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.listingDatesText}>
            {formatDate(item.availableFrom)} - {formatDate(item.availableTo)}
          </Text>
        </View>
        
        <View style={styles.listingFooter}>
          <View style={styles.listingOwner}>
            {item.owner.profilePicture ? (
              <Image source={{ uri: item.owner.profilePicture }} style={styles.ownerAvatar} />
            ) : (
              <View style={styles.ownerAvatarPlaceholder}>
                <Text style={styles.ownerAvatarText}>
                  {item.owner.fullName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.ownerName} numberOfLines={1}>
              {item.owner.fullName}
            </Text>
          </View>
          
          <View style={styles.listingStats}>
            <Ionicons name="eye-outline" size={14} color="#999" />
            <Text style={styles.listingStatText}>{item.views}</Text>
            <Ionicons name="heart-outline" size={14} color="#999" style={{ marginLeft: 10 }} />
            <Text style={styles.listingStatText}>{item.favorites}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const filters = [
    { id: 'swap', label: 'Swap Only', icon: 'swap-horizontal' },
    { id: 'rent', label: 'Rent Only', icon: 'cash-outline' },
    { id: 'furnished', label: 'Furnished', icon: 'bed-outline' },
    { id: 'utilities', label: 'Utilities Inc.', icon: 'flash-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.headerTitle}>Find Your Perfect Swap</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <View style={styles.profileButton}>
              <Ionicons name="person-circle-outline" size={32} color="#667eea" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by city, university, or keyword..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={() => navigation.navigate('Filter')}>
            <Ionicons name="options-outline" size={24} color="#667eea" />
          </TouchableOpacity>
        </View>

        {/* Quick Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && styles.filterChipActive,
              ]}
              onPress={() => handleFilterPress(filter.id)}
            >
              <Ionicons
                name={filter.icon as any}
                size={16}
                color={selectedFilter === filter.id ? '#fff' : '#667eea'}
              />
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === filter.id && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Section */}
        {featuredListings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Listings</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {featuredListings.map((listing) => (
                <TouchableOpacity
                  key={listing._id}
                  style={styles.featuredCard}
                  onPress={() => navigation.navigate('ListingDetail', { listingId: listing._id })}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.featuredGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.featuredTitle} numberOfLines={2}>
                      {listing.title}
                    </Text>
                    <Text style={styles.featuredLocation}>
                      {listing.nearUniversity}
                    </Text>
                    <View style={styles.featuredDetails}>
                      <Text style={styles.featuredDetail}>
                        {listing.bedrooms} bed • {listing.bathrooms} bath
                      </Text>
                      {listing.rentPrice && (
                        <Text style={styles.featuredPrice}>${listing.rentPrice}/mo</Text>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Listings</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllListings')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <ActivityIndicator size="large" color="#667eea" style={styles.loader} />
          ) : listings.length > 0 ? (
            <FlatList
              data={listings}
              renderItem={renderListingCard}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              contentContainerStyle={styles.listingsContainer}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="home-search-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateTitle}>No Listings Yet</Text>
              <Text style={styles.emptyStateText}>
                Be the first to create a listing in your area!
              </Text>
              <TouchableOpacity
                style={styles.createListingButton}
                onPress={() => navigation.navigate('CreateListing')}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.createListingGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#fff" />
                  <Text style={styles.createListingText}>Create Listing</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateListing')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  profileButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#667eea',
  },
  filterChipActive: {
    backgroundColor: '#667eea',
  },
  filterChipText: {
    fontSize: 14,
    color: '#667eea',
    marginLeft: 5,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  featuredCard: {
    width: 250,
    height: 140,
    marginLeft: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  featuredGradient: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  featuredLocation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
  },
  featuredDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredDetail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  featuredPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  listingsContainer: {
    paddingHorizontal: 20,
  },
  listingCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  listingImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  listingBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  listingContent: {
    padding: 15,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  listingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  listingLocationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  listingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  listingDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  listingDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  listingPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  listingDates: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  listingDatesText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  listingOwner: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ownerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  ownerAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  ownerAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  ownerName: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  listingStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listingStatText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  loader: {
    paddingVertical: 50,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  createListingButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  createListingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  createListingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;