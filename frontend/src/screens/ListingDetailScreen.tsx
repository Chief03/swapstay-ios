import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/api';
import RequestModal from './RequestModal';

const { width: screenWidth } = Dimensions.get('window');

interface ListingDetailScreenProps {
  navigation: any;
  route: any;
}

interface Listing {
  _id: string;
  title: string;
  description: string;
  listingType: string;
  propertyType: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  nearUniversity: string;
  distanceToCampus?: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  availableFrom: string;
  availableTo: string;
  flexibleDates: boolean;
  minimumStay: number;
  rentPrice?: number;
  securityDeposit?: number;
  utilitiesIncluded: boolean;
  amenities: {
    wifi?: boolean;
    parking?: boolean;
    laundry?: boolean;
    airConditioning?: boolean;
    heating?: boolean;
    furnished?: boolean;
    petFriendly?: boolean;
    kitchen?: boolean;
    gym?: boolean;
    pool?: boolean;
  };
  houseRules?: {
    smokingAllowed?: boolean;
    petsAllowed?: boolean;
    guestsAllowed?: boolean;
    quietHours?: string;
  };
  photos: Array<{ url: string; caption?: string }>;
  owner: {
    _id: string;
    fullName: string;
    email: string;
    university: string;
    profilePicture?: string;
    bio?: string;
    yearInSchool?: string;
    major?: string;
  };
  views: number;
  favorites: number;
}

const ListingDetailScreen: React.FC<ListingDetailScreenProps> = ({ navigation, route }) => {
  const { theme, isDarkMode } = useTheme();
  const { listingId } = route.params;
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    loadListing();
    checkIfSaved();
  }, [listingId]);

  const loadListing = async () => {
    try {
      const response = await apiService.getListingById(listingId);
      if (response.success && response.listing) {
        setListing(response.listing);
      } else {
        Alert.alert('Error', 'Failed to load listing');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Load listing error:', error);
      Alert.alert('Error', 'Failed to load listing');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      const response = await apiService.isListingSaved(listingId);
      if (response.success) {
        setIsSaved(response.isSaved);
      }
    } catch (error) {
      console.log('Check saved error:', error);
    }
  };

  const handleToggleSave = async () => {
    try {
      const response = await apiService.toggleWishlist(listingId);
      if (response.success) {
        setIsSaved(response.isSaved);
        Alert.alert(
          'Success',
          response.isSaved ? 'Added to wishlist' : 'Removed from wishlist'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update wishlist');
    }
  };

  const handleContactOwner = () => {
    if (!listing.owner) {
      Alert.alert('Error', 'Owner information not available');
      return;
    }

    // Navigate to chat screen with the listing owner
    navigation.navigate('Chat', {
      recipient: listing.owner,
      listing: listing
    });
  };

  const handleRequestSwap = () => {
    if (!listing) return;
    setShowRequestModal(true);
  };

  const handleRequestSuccess = () => {
    // Could navigate to messages or refresh data
    console.log('Request sent successfully');
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    Alert.alert('Share', 'Share functionality coming soon!');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getListingTypeColor = (type: string) => {
    switch (type) {
      case 'SWAP_ONLY': return '#10B981';
      case 'RENT_ONLY': return '#3B82F6';
      case 'BOTH': return theme.colors.primary;
      default: return theme.colors.primary;
    }
  };

  const renderAmenity = (icon: string, label: string, available: boolean) => {
    if (!available) return null;
    
    return (
      <View key={label} style={styles.amenityItem}>
        <MaterialCommunityIcons 
          name={icon as any} 
          size={24} 
          color={theme.colors.primary} 
        />
        <Text style={styles.amenityLabel}>{label}</Text>
      </View>
    );
  };

  const renderPhoto = ({ item, index }: { item: { url: string; caption?: string }, index: number }) => {
    // Handle local file URLs for testing
    const isLocalFile = item.url.startsWith('file://');
    
    return (
      <View style={styles.photoContainer}>
        {isLocalFile ? (
          <View style={styles.placeholderPhoto}>
            <MaterialCommunityIcons 
              name="image-off" 
              size={48} 
              color={theme.colors.onSurfaceVariant} 
            />
            <Text style={styles.placeholderText}>Photo {index + 1}</Text>
          </View>
        ) : (
          <Image 
            source={{ uri: item.url }} 
            style={styles.photo}
            resizeMode="cover"
          />
        )}
      </View>
    );
  };

  const styles = createStyles(theme, isDarkMode);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Listing not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Photo Gallery */}
        <View style={styles.gallery}>
          {listing.photos && listing.photos.length > 0 ? (
            <>
              <FlatList
                data={listing.photos}
                renderItem={renderPhoto}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const index = Math.floor(event.nativeEvent.contentOffset.x / screenWidth);
                  setActivePhotoIndex(index);
                }}
              />
              {listing.photos.length > 1 && (
                <View style={styles.photoIndicator}>
                  <Text style={styles.photoIndicatorText}>
                    {activePhotoIndex + 1} / {listing.photos.length}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.noPhotoContainer}>
              <MaterialCommunityIcons 
                name="image-off" 
                size={64} 
                color={theme.colors.onSurfaceVariant} 
              />
              <Text style={styles.noPhotoText}>No photos available</Text>
            </View>
          )}
          
          {/* Action Buttons Overlay */}
          <View style={styles.photoActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.rightActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { marginLeft: 10 }]}
                onPress={handleToggleSave}
              >
                <Ionicons 
                  name={isSaved ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isSaved ? "#FF4458" : "#fff"} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.typeBadge, { backgroundColor: getListingTypeColor(listing.listingType) }]}>
              <Text style={styles.typeBadgeText}>
                {listing.listingType === 'BOTH' ? 'Swap & Rent' : listing.listingType.replace('_ONLY', '')}
              </Text>
            </View>
            <View style={styles.stats}>
              <Ionicons name="eye-outline" size={16} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.statText}>{listing.views} views</Text>
              <Ionicons name="heart-outline" size={16} color={theme.colors.onSurfaceVariant} style={{ marginLeft: 10 }} />
              <Text style={styles.statText}>{listing.favorites} saves</Text>
            </View>
          </View>

          {/* Title & Price */}
          <Text style={styles.title}>{listing.title}</Text>
          {listing.rentPrice && (
            <Text style={styles.price}>${listing.rentPrice}/month</Text>
          )}

          {/* Location */}
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={20} color={theme.colors.primary} />
            <View style={styles.locationText}>
              <Text style={styles.address}>
                {listing.address.street}
              </Text>
              <Text style={styles.cityState}>
                {listing.address.city}, {listing.address.state} {listing.address.zipCode}
              </Text>
              <Text style={styles.university}>
                Near {listing.nearUniversity}
                {listing.distanceToCampus && ` • ${listing.distanceToCampus} miles to campus`}
              </Text>
            </View>
          </View>

          {/* Property Details */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="home" size={24} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.detailLabel}>{listing.propertyType}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="bed" size={24} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.detailLabel}>{listing.bedrooms} bed</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="shower" size={24} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.detailLabel}>{listing.bathrooms} bath</Text>
            </View>
            {listing.squareFeet && (
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="floor-plan" size={24} color={theme.colors.onSurfaceVariant} />
                <Text style={styles.detailLabel}>{listing.squareFeet} sqft</Text>
              </View>
            )}
          </View>

          {/* Availability */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <View style={styles.availabilityContainer}>
              <View style={styles.dateCard}>
                <Text style={styles.dateLabel}>From</Text>
                <Text style={styles.dateValue}>{formatDate(listing.availableFrom)}</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={theme.colors.onSurfaceVariant} />
              <View style={styles.dateCard}>
                <Text style={styles.dateLabel}>To</Text>
                <Text style={styles.dateValue}>{formatDate(listing.availableTo)}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Minimum Stay:</Text>
              <Text style={styles.infoValue}>{listing.minimumStay} days</Text>
            </View>
            {listing.flexibleDates && (
              <View style={styles.flexibleBadge}>
                <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.flexibleText}>Flexible Dates</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {renderAmenity('wifi', 'WiFi', listing.amenities.wifi || false)}
              {renderAmenity('car', 'Parking', listing.amenities.parking || false)}
              {renderAmenity('washing-machine', 'Laundry', listing.amenities.laundry || false)}
              {renderAmenity('air-conditioner', 'AC', listing.amenities.airConditioning || false)}
              {renderAmenity('fire', 'Heating', listing.amenities.heating || false)}
              {renderAmenity('sofa', 'Furnished', listing.amenities.furnished || false)}
              {renderAmenity('paw', 'Pet Friendly', listing.amenities.petFriendly || false)}
              {renderAmenity('silverware-fork-knife', 'Kitchen', listing.amenities.kitchen || false)}
              {renderAmenity('dumbbell', 'Gym', listing.amenities.gym || false)}
              {renderAmenity('pool', 'Pool', listing.amenities.pool || false)}
            </View>
            {listing.utilitiesIncluded && (
              <View style={styles.utilitiesBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.utilitiesText}>Utilities Included</Text>
              </View>
            )}
          </View>

          {/* House Rules */}
          {listing.houseRules && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>House Rules</Text>
              <View style={styles.rulesContainer}>
                <View style={styles.ruleItem}>
                  <Ionicons 
                    name={listing.houseRules.smokingAllowed ? "checkmark-circle" : "close-circle"} 
                    size={20} 
                    color={listing.houseRules.smokingAllowed ? "#10B981" : "#EF4444"} 
                  />
                  <Text style={styles.ruleText}>
                    {listing.houseRules.smokingAllowed ? 'Smoking allowed' : 'No smoking'}
                  </Text>
                </View>
                <View style={styles.ruleItem}>
                  <Ionicons 
                    name={listing.houseRules.petsAllowed ? "checkmark-circle" : "close-circle"} 
                    size={20} 
                    color={listing.houseRules.petsAllowed ? "#10B981" : "#EF4444"} 
                  />
                  <Text style={styles.ruleText}>
                    {listing.houseRules.petsAllowed ? 'Pets allowed' : 'No pets'}
                  </Text>
                </View>
                <View style={styles.ruleItem}>
                  <Ionicons 
                    name={listing.houseRules.guestsAllowed ? "checkmark-circle" : "close-circle"} 
                    size={20} 
                    color={listing.houseRules.guestsAllowed ? "#10B981" : "#EF4444"} 
                  />
                  <Text style={styles.ruleText}>
                    {listing.houseRules.guestsAllowed ? 'Guests allowed' : 'No guests'}
                  </Text>
                </View>
                {listing.houseRules.quietHours && (
                  <View style={styles.ruleItem}>
                    <Ionicons name="moon" size={20} color={theme.colors.primary} />
                    <Text style={styles.ruleText}>
                      Quiet hours: {listing.houseRules.quietHours}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Owner Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Listed by</Text>
            <TouchableOpacity 
              style={styles.ownerCard}
              onPress={() => navigation.navigate('UserProfile', { userId: listing.owner._id })}
            >
              <View style={styles.ownerAvatar}>
                {listing.owner.profilePicture ? (
                  <Image 
                    source={{ uri: listing.owner.profilePicture }} 
                    style={styles.avatarImage}
                  />
                ) : (
                  <Ionicons name="person" size={32} color={theme.colors.onSurfaceVariant} />
                )}
              </View>
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerName}>{listing.owner.fullName}</Text>
                <Text style={styles.ownerUniversity}>{listing.owner.university}</Text>
                {listing.owner.yearInSchool && (
                  <Text style={styles.ownerDetails}>
                    {listing.owner.yearInSchool}
                    {listing.owner.major && ` • ${listing.owner.major}`}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Pricing Details */}
          {listing.rentPrice && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pricing</Text>
              <View style={styles.pricingContainer}>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Monthly Rent</Text>
                  <Text style={styles.pricingValue}>${listing.rentPrice}</Text>
                </View>
                {listing.securityDeposit && (
                  <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabel}>Security Deposit</Text>
                    <Text style={styles.pricingValue}>${listing.securityDeposit}</Text>
                  </View>
                )}
                {!listing.utilitiesIncluded && (
                  <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabel}>Utilities</Text>
                    <Text style={styles.pricingValue}>Not included</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.messageButton}
          onPress={handleContactOwner}
        >
          <Ionicons name="chatbubble-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleRequestSwap}
        >
          <LinearGradient
            colors={isDarkMode ? [theme.colors.primary, theme.colors.secondary] : ['#667eea', '#764ba2']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Text style={styles.primaryButtonText}>
            {listing.listingType === 'RENT_ONLY' ? 'Request to Rent' : 'Request Swap'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Request Modal */}
      <RequestModal
        visible={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        listing={listing}
        onSuccess={handleRequestSuccess}
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: any, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  gallery: {
    height: 300,
    backgroundColor: theme.colors.surface,
  },
  photoContainer: {
    width: screenWidth,
    height: 300,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  placeholderPhoto: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceVariant,
  },
  placeholderText: {
    marginTop: 10,
    color: theme.colors.onSurfaceVariant,
  },
  noPhotoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceVariant,
  },
  noPhotoText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
  },
  photoIndicator: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  photoIndicatorText: {
    color: '#fff',
    fontSize: 14,
  },
  photoActions: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rightActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginLeft: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 10,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  locationText: {
    marginLeft: 10,
    flex: 1,
  },
  address: {
    fontSize: 16,
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  cityState: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  university: {
    fontSize: 14,
    color: theme.colors.primary,
    marginTop: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginLeft: 8,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 15,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dateCard: {
    flex: 1,
    backgroundColor: theme.colors.surfaceVariant,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.onSurface,
  },
  flexibleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  flexibleText: {
    fontSize: 12,
    color: theme.colors.primary,
    marginLeft: 6,
    fontWeight: '500',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.onSurface,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingVertical: 10,
  },
  amenityLabel: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginLeft: 10,
  },
  utilitiesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  utilitiesText: {
    fontSize: 14,
    color: '#10B981',
    marginLeft: 8,
    fontWeight: '500',
  },
  rulesContainer: {
    backgroundColor: theme.colors.surfaceVariant,
    padding: 15,
    borderRadius: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ruleText: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginLeft: 10,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceVariant,
    padding: 15,
    borderRadius: 12,
  },
  ownerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  ownerUniversity: {
    fontSize: 14,
    color: theme.colors.primary,
    marginTop: 2,
  },
  ownerDetails: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  pricingContainer: {
    backgroundColor: theme.colors.surfaceVariant,
    padding: 15,
    borderRadius: 12,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pricingLabel: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
  pricingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginRight: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: 8,
  },
  primaryButton: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ListingDetailScreen;