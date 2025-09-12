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
      if (filterType === 'swap') {
        params.listingType = 'SWAP_ONLY';
      } else if (filterType === 'rent') {
        params.listingType = 'RENT_ONLY';
      } else if (filterType === 'furnished') {
        // Filter for furnished amenity
        params.amenities = 'furnished';
      } else if (filterType === 'parking') {
        // Filter for parking amenity
        params.amenities = 'parking';
      }
      
      const response = await apiService.getListings(params);
      setListings(response);
    } catch (error) {
      console.error('Error loading listings:', error);
      // Alert.alert('Error', 'Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFeaturedListings = async () => {
    try {
      // For now, just populate with sample data
      const sampleFeatured = [
        {
          _id: 'featured1',
          title: 'Luxury Downtown Loft',
          address: { city: 'Austin', state: 'TX' },
          propertyType: 'Loft',
          bedrooms: 2,
        },
        {
          _id: 'featured2',
          title: 'Cozy Campus Adjacent Studio',
          address: { city: 'Stanford', state: 'CA' },
          propertyType: 'Studio',
          bedrooms: 1,
        },
        {
          _id: 'featured3',
          title: 'Modern Apartment Near UT',
          address: { city: 'Austin', state: 'TX' },
          propertyType: 'Apartment',
          bedrooms: 3,
        },
      ] as any;
      setFeaturedListings(sampleFeatured);
    } catch (error) {
      console.error('Error loading featured listings:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadListings(selectedFilter || undefined);
    await loadFeaturedListings();
    setIsRefreshing(false);
  };

  const handleFilterPress = async (filterId: string) => {
    if (selectedFilter === filterId) {
      // Deselect filter
      setSelectedFilter(null);
      setIsLoading(true);
      await loadListings();
    } else {
      // Select new filter
      setSelectedFilter(filterId);
      setIsLoading(true);
      await loadListings(filterId);
    }
  };

  const handleSearch = () => {
    // TODO: Implement search
    Alert.alert('Search', 'Search functionality coming soon!');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPropertyIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'apartment': return 'business';
      case 'house': return 'home';
      case 'studio': return 'square';
      case 'condo': return 'business-outline';
      case 'townhouse': return 'home-variant';
      case 'loft': return 'home-modern';
      default: return 'home';
    }
  };

  const getListingTypeColor = (type: string) => {
    switch (type) {
      case 'SWAP_ONLY': return '#10B981';
      case 'RENT_ONLY': return '#3B82F6';
      case 'BOTH': return theme.colors.primary;
      default: return theme.colors.primary;
    }
  };

  const renderListingCard = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      style={styles.listingCard}
      onPress={() => navigation.navigate('ListingDetail', { listingId: item._id })}
      activeOpacity={0.9}
    >
      <View style={[styles.listingImage, styles.placeholderImage]}>
        <MaterialCommunityIcons 
          name={getPropertyIcon(item.propertyType)} 
          size={48} 
          color={theme.colors.onSurfaceVariant} 
        />
        <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
          {item.propertyType}
        </Text>
      </View>

      <View style={styles.listingContent}>
        <View style={styles.listingHeader}>
          <View style={[styles.typeBadge, { backgroundColor: getListingTypeColor(item.listingType) }]}>
            <Text style={styles.typeBadgeText}>
              {item.listingType === 'BOTH' ? 'Swap & Rent' : item.listingType.replace('_ONLY', '')}
            </Text>
          </View>
          <View style={styles.listingStats}>
            <Ionicons name="eye-outline" size={14} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.statText}>{item.views}</Text>
            <Ionicons name="heart-outline" size={14} color={theme.colors.onSurfaceVariant} style={{ marginLeft: 8 }} />
            <Text style={styles.statText}>{item.favorites}</Text>
          </View>
        </View>

        <Text style={styles.listingTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.listingDetails}>
          <MaterialCommunityIcons name="bed" size={16} color={theme.colors.onSurfaceVariant} />
          <Text style={styles.detailText}>{item.bedrooms} bed</Text>
          <Text style={styles.detailDivider}>•</Text>
          <MaterialCommunityIcons name="shower" size={16} color={theme.colors.onSurfaceVariant} />
          <Text style={styles.detailText}>{item.bathrooms} bath</Text>
          {item.rentPrice && (
            <>
              <Text style={styles.detailDivider}>•</Text>
              <Text style={styles.detailText}>${item.rentPrice}/mo</Text>
            </>
          )}
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color={theme.colors.onSurfaceVariant} />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.address.city}, {item.address.state} • Near {item.nearUniversity}
          </Text>
        </View>

        <View style={styles.listingFooter}>
          <Text style={styles.dateText}>
            {formatDate(item.availableFrom)} - {formatDate(item.availableTo)}
          </Text>
          {item.rentPrice && (
            <Text style={styles.priceText}>${item.rentPrice}/mo</Text>
          )}
        </View>

        <View style={styles.ownerInfo}>
          <View style={[styles.ownerAvatar, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Ionicons name="person" size={20} color={theme.colors.onSurfaceVariant} />
          </View>
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

  const styles = createStyles(theme, isDarkMode);

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require('../../assets/new_logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Welcome back!</Text>
              <Text style={styles.headerTitle}>Find Your Perfect Swap</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle-outline" size={32} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={theme.colors.onSurfaceVariant} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by city or university..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => navigation.navigate('Filter', {
              onApplyFilters: (filters: any) => {
                console.log('Applied filters:', filters);
                // TODO: Apply filters to loadListings
              }
            })}
          >
            <Ionicons name="options-outline" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
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
                color={selectedFilter === filter.id ? theme.colors.onPrimary : theme.colors.primary}
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
                    colors={isDarkMode ? [theme.colors.primary, theme.colors.secondary] : ['#667eea', '#764ba2']}
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
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
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
              <MaterialCommunityIcons name="home-search" size={64} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.emptyTitle}>No Listings Found</Text>
              <Text style={styles.emptyText}>
                {selectedFilter 
                  ? `No ${selectedFilter} listings available right now.`
                  : 'Be the first to create a listing!'}
              </Text>
              <TouchableOpacity
                style={[styles.filterChip, { paddingHorizontal: 20, paddingVertical: 12 }]}
                onPress={() => navigation.navigate('CreateListing')}
              >
                <Text style={[styles.filterChipText, { fontSize: 16 }]}>Create Listing</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateListing')}
      >
        <LinearGradient
          colors={isDarkMode ? [theme.colors.primary, theme.colors.secondary] : ['#667eea', '#764ba2']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const createStyles = (theme: any, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  fixedHeader: {
    backgroundColor: theme.colors.surface,
    paddingTop: 0,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.2 : 0.1,
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
    paddingTop: 10,
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
    color: theme.colors.onSurfaceVariant,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
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
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 45,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: theme.colors.onSurface,
  },
  filterButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceVariant,
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
    backgroundColor: isDarkMode ? theme.colors.elevation.level2 : theme.colors.primaryContainer,
    marginRight: 10,
    borderWidth: 1,
    borderColor: isDarkMode ? theme.colors.outline : theme.colors.primary + '30',
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    marginLeft: 5,
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: theme.colors.onPrimary,
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
    color: theme.colors.onBackground,
  },
  seeAll: {
    fontSize: 14,
    color: theme.colors.primary,
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
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.3 : 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  listingImage: {
    width: '100%',
    height: 180,
    backgroundColor: theme.colors.surfaceVariant,
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
    color: theme.colors.onSurfaceVariant,
    marginLeft: 3,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 10,
  },
  listingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    marginLeft: 4,
  },
  detailDivider: {
    marginHorizontal: 8,
    color: theme.colors.onSurfaceVariant,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
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
    borderTopColor: theme.colors.outline,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  ownerUniversity: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  loader: {
    paddingVertical: 40,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDarkMode ? 0.5 : 0.3,
    shadowRadius: 6,
    elevation: 8,
    overflow: 'hidden',
  },
});

export default HomeScreen;