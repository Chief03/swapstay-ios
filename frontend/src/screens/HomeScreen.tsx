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
import { useTheme } from '../contexts/ThemeContext';
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
  const { theme, isDarkMode } = useTheme();
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

  const loadListings = async (filterType?: string) => {
    try {
      const params: any = { limit: 10 };
      
      // Apply filter based on selected filter type
      // Note: We don't include BOTH listings in specific filters because
      // the backend listingType filter is exact match only
      if (filterType === 'swap') {
        params.listingType = 'SWAP_ONLY';
      } else if (filterType === 'rent') {
        params.listingType = 'RENT_ONLY';
      }
      // For 'furnished' and 'parking', we'll need to extend the backend to support these filters
      // For now, just log them
      if (filterType === 'furnished') {
        console.log('Furnished filter selected - backend support needed');
      }
      if (filterType === 'parking') {
        console.log('Parking filter selected - backend support needed');
      }
      
      const response = await apiService.getListings(params);
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
    await Promise.all([loadListings(selectedFilter || undefined), loadFeaturedListings()]);
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
    const newFilter = filter === selectedFilter ? null : filter;
    setSelectedFilter(newFilter);
    setIsLoading(true);
    loadListings(newFilter || undefined);
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
      onPress={() => {
        navigation.navigate('ListingDetail', { listingId: item._id });
      }}
    >
      {item.photos && item.photos.length > 0 ? (
        <Image source={{ uri: item.photos[0].url }} style={styles.listingImage} />
      ) : (
        <View style={[styles.listingImage, styles.placeholderImage]}>
          <MaterialCommunityIcons name="home" size={40} color="#ccc" />
        </View>
      )}
      
      <View style={styles.listingContent}>
        <View style={styles.listingHeader}>
          <View style={[styles.typeBadge, { backgroundColor: getListingTypeColor(item.listingType) }]}>
            <Text style={styles.typeBadgeText}>{item.listingType.replace('_', ' ')}</Text>
          </View>
          <View style={styles.listingStats}>
            <Ionicons name="eye-outline" size={14} color="#666" />
            <Text style={styles.statText}>{item.views || 0}</Text>
            <Ionicons name="heart-outline" size={14} color="#666" style={{ marginLeft: 8 }} />
            <Text style={styles.statText}>{item.favorites || 0}</Text>
          </View>
        </View>
        
        <Text style={styles.listingTitle} numberOfLines={2}>{item.title}</Text>
        
        <View style={styles.listingDetails}>
          <MaterialCommunityIcons name={getPropertyIcon(item.propertyType)} size={16} color="#666" />
          <Text style={styles.detailText}>{item.propertyType}</Text>
          <Text style={styles.detailDivider}>•</Text>
          <Ionicons name="bed-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.bedrooms} bed</Text>
          <Text style={styles.detailDivider}>•</Text>
          <Ionicons name="water-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.bathrooms} bath</Text>
        </View>
        
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.locationText}>
            {item.address.city}, {item.address.state} • Near {item.nearUniversity}
          </Text>
        </View>
        
        <View style={styles.listingFooter}>
          <Text style={styles.dateText}>
            Available {formatDate(item.availableFrom)} - {formatDate(item.availableTo)}
          </Text>
          {item.rentPrice && (
            <Text style={styles.priceText}>${item.rentPrice}/mo</Text>
          )}
        </View>
        
        <View style={styles.ownerInfo}>
          <Image 
            source={{ uri: item.owner.profilePicture || 'https://i.pravatar.cc/100' }} 
            style={styles.ownerAvatar}
          />
          <View>
            <Text style={styles.ownerName}>{item.owner.fullName}</Text>
            <Text style={styles.ownerUniversity}>{item.owner.university}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const filters = [
    { id: 'swap', label: 'Swap Only', icon: 'swap-horizontal' },
    { id: 'rent', label: 'Rent Only', icon: 'cash-outline' },
    { id: 'furnished', label: 'Furnished', icon: 'bed-outline' },
    { id: 'parking', label: 'Parking', icon: 'car-outline' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Fixed Header Section */}
      <View style={[styles.fixedHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outline }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View style={styles.headerText}>
              <Text style={[styles.greeting, { color: theme.colors.onSurfaceVariant }]}>Welcome back!</Text>
              <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Find Your Perfect Swap</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <View style={styles.profileButton}>
              <Ionicons name="person-circle-outline" size={32} color={theme.colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]}>
            <Ionicons name="search" size={20} color={theme.colors.onSurfaceVariant} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.onSurface }]}
              placeholder="Search by city, university, or keyword..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </View>
          <TouchableOpacity style={[styles.filterButton, { backgroundColor: theme.colors.surfaceVariant }]} onPress={() => {
            navigation.navigate('FilterScreen' as never, { filters: {} });
          }}>
            <Ionicons name="options-outline" size={24} color={theme.colors.primary} />
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
      </View>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
      >
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
                      {listing.address.city}, {listing.address.state}
                    </Text>
                    <View style={styles.featuredDetails}>
                      <Text style={styles.featuredDetail}>
                        {listing.propertyType} • {listing.bedrooms} bed
                      </Text>
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
            <TouchableOpacity onPress={() => {
              Alert.alert('All Listings', 'All listings view coming soon!');
            }}>
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
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="home-search" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No Listings Yet</Text>
              <Text style={styles.emptyText}>Be the first to create a listing in your area!</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('CreateListing' as never)}
              >
                <Ionicons name="add-circle-outline" size={24} color="#fff" />
                <Text style={styles.createButtonText}>Create Listing</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateListing' as never)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  fixedHeader: {
    backgroundColor: '#fff',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 100,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 45,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
  },
  filterButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0ff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0ff',
  },
  filterChipActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterChipText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  section: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    width: 280,
    marginRight: 15,
  },
  featuredGradient: {
    borderRadius: 16,
    padding: 20,
    height: 140,
    justifyContent: 'space-between',
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  featuredLocation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
  },
  featuredDetails: {
    flexDirection: 'row',
  },
  featuredDetail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  listingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  listingImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f5f5f5',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingContent: {
    padding: 15,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  listingStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 3,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  listingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  detailDivider: {
    marginHorizontal: 8,
    color: '#ccc',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  ownerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  ownerUniversity: {
    fontSize: 11,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loader: {
    marginTop: 50,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});

export default HomeScreen;