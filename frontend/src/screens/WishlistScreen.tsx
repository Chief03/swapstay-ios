import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/api';

interface SavedListing {
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
  owner: {
    fullName: string;
    university: string;
  };
  savedAt?: Date;
}

interface WishlistScreenProps {
  navigation: any;
}

const WishlistScreen: React.FC<WishlistScreenProps> = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadSavedListings();
  }, []);

  const loadSavedListings = async () => {
    try {
      const response = await apiService.getSavedListings();
      if (response.success && response.savedListings) {
        setSavedListings(response.savedListings);
      }
    } catch (error) {
      console.error('Error loading saved listings:', error);
      // Use empty array if error
      setSavedListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSavedListings();
    setIsRefreshing(false);
  };

  const handleRemoveFromWishlist = (listingId: string) => {
    Alert.alert(
      'Remove from Wishlist',
      'Are you sure you want to remove this listing from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.removeFromWishlist(listingId);
              if (response.success) {
                setSavedListings(prev => prev.filter(item => item._id !== listingId));
                Alert.alert('Success', 'Listing removed from wishlist');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to remove listing');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getListingTypeColor = (type: string) => {
    switch (type) {
      case 'SWAP_ONLY': return '#10B981';
      case 'RENT_ONLY': return '#3B82F6';
      case 'BOTH': return theme.colors.primary;
      default: return theme.colors.primary;
    }
  };

  const renderSavedListing = ({ item }: { item: SavedListing }) => (
    <TouchableOpacity
      style={styles.listingCard}
      onPress={() => navigation.navigate('ListingDetail', { listingId: item._id })}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.typeBadge, { backgroundColor: getListingTypeColor(item.listingType) }]}>
          <Text style={styles.typeBadgeText}>
            {item.listingType === 'BOTH' ? 'Swap & Rent' : item.listingType.replace('_ONLY', '')}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.heartButton}
          onPress={() => handleRemoveFromWishlist(item._id)}
        >
          <Ionicons name="heart" size={24} color={theme.colors.error} />
        </TouchableOpacity>
      </View>

      <Text style={styles.listingTitle} numberOfLines={2}>
        {item.title}
      </Text>

      <View style={styles.infoRow}>
        <MaterialCommunityIcons name="map-marker" size={16} color={theme.colors.onSurfaceVariant} />
        <Text style={styles.infoText}>
          {item.address.city}, {item.address.state} • Near {item.nearUniversity}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialCommunityIcons name="home" size={16} color={theme.colors.onSurfaceVariant} />
        <Text style={styles.infoText}>
          {item.propertyType} • {item.bedrooms} bed, {item.bathrooms} bath
        </Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialCommunityIcons name="calendar-range" size={16} color={theme.colors.onSurfaceVariant} />
        <Text style={styles.infoText}>
          {formatDate(item.availableFrom)} - {formatDate(item.availableTo)}
        </Text>
      </View>

      {item.rentPrice && (
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Monthly Rent:</Text>
          <Text style={styles.priceText}>${item.rentPrice}</Text>
        </View>
      )}

      {item.savedAt && (
        <Text style={styles.savedDate}>
          Saved {new Date(item.savedAt).toLocaleDateString()}
        </Text>
      )}
    </TouchableOpacity>
  );

  const styles = createStyles(theme, isDarkMode);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Listings</Text>
        <Text style={styles.headerSubtitle}>
          {savedListings.length} {savedListings.length === 1 ? 'listing' : 'listings'} saved
        </Text>
      </View>

      {savedListings.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons 
            name="heart-off-outline" 
            size={80} 
            color={theme.colors.onSurfaceVariant} 
          />
          <Text style={styles.emptyTitle}>No Saved Listings Yet</Text>
          <Text style={styles.emptyText}>
            Start exploring and save listings you're interested in!
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.exploreButtonText}>Explore Listings</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedListings}
          renderItem={renderSavedListing}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: any, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
    backgroundColor: theme.colors.surface,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
  },
  listingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  heartButton: {
    padding: 4,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginLeft: 8,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  priceLabel: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  savedDate: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
  },
  exploreButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WishlistScreen;