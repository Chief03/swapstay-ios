import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import apiService from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ListingDetailScreenProps {
  navigation: any;
  route: any;
}

const ListingDetailScreen: React.FC<ListingDetailScreenProps> = ({ navigation, route }) => {
  const { listingId } = route.params;
  const [listing, setListing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    loadListingDetails();
  }, [listingId]);

  const loadListingDetails = async () => {
    try {
      const response = await apiService.getListingById(listingId);
      if (response.success) {
        setListing(response.listing);
        setIsFavorited(response.listing.isFavorited || false);
      }
    } catch (error) {
      console.error('Error loading listing details:', error);
      Alert.alert('Error', 'Failed to load listing details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    setIsFavorited(!isFavorited);
    // TODO: Implement API call to toggle favorite
  };

  const handleContactOwner = () => {
    // Navigate to messages screen with owner info
    navigation.navigate('Messages', { 
      ownerId: listing.owner._id,
      ownerName: listing.owner.fullName,
      listingTitle: listing.title 
    });
  };

  const handleReportListing = () => {
    Alert.alert(
      'Report Listing',
      'Why are you reporting this listing?',
      [
        { text: 'Inappropriate content', onPress: () => reportListing('inappropriate') },
        { text: 'Scam or fraud', onPress: () => reportListing('scam') },
        { text: 'Incorrect information', onPress: () => reportListing('incorrect') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const reportListing = async (reason: string) => {
    // TODO: Implement API call to report listing
    Alert.alert('Reported', 'Thank you for your report. We will review this listing.');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPropertyTypeIcon = (type: string) => {
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading listing details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#999" />
          <Text style={styles.errorText}>Listing not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const defaultImages = [
    { uri: 'https://via.placeholder.com/400x300/667eea/ffffff?text=SwapStay' }
  ];
  const images = listing.photos?.length > 0 ? listing.photos : defaultImages;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {images.map((image: any, index: number) => (
              <Image
                key={index}
                source={{ uri: image.uri || image }}
                style={styles.image}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          
          {/* Image Indicators */}
          {images.length > 1 && (
            <View style={styles.imageIndicatorContainer}>
              {images.map((_: any, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.imageIndicator,
                    index === activeImageIndex && styles.imageIndicatorActive
                  ]}
                />
              ))}
            </View>
          )}

          {/* Header Actions */}
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <View style={styles.headerRightActions}>
              <TouchableOpacity style={styles.headerButton} onPress={handleToggleFavorite}>
                <Ionicons 
                  name={isFavorited ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isFavorited ? "#e74c3c" : "#333"} 
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={() => {}}>
                <Ionicons name="share-outline" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Type Badge */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{listing.title}</Text>
              <View style={[
                styles.typeBadge,
                listing.listingType === 'SWAP_ONLY' && styles.swapBadge,
                listing.listingType === 'RENT_ONLY' && styles.rentBadge,
                listing.listingType === 'BOTH' && styles.bothBadge,
              ]}>
                <Text style={styles.typeBadgeText}>
                  {listing.listingType === 'BOTH' ? 'Swap or Rent' : 
                   listing.listingType === 'SWAP_ONLY' ? 'Swap Only' : 'Rent Only'}
                </Text>
              </View>
            </View>
            
            {/* Location */}
            <View style={styles.locationRow}>
              <Ionicons name="location" size={18} color="#667eea" />
              <Text style={styles.location}>
                {listing.address.street}, {listing.address.city}, {listing.address.state} {listing.address.zipCode}
              </Text>
            </View>
            
            {/* Near University */}
            <View style={styles.universityRow}>
              <FontAwesome5 name="graduation-cap" size={14} color="#666" />
              <Text style={styles.universityText}>Near {listing.nearUniversity}</Text>
              {listing.distanceToCampus && (
                <Text style={styles.distanceText}> • {listing.distanceToCampus} miles to campus</Text>
              )}
            </View>
          </View>

          {/* Property Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Property Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons 
                  name={getPropertyTypeIcon(listing.propertyType)} 
                  size={24} 
                  color="#667eea" 
                />
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>{listing.propertyType}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="bed" size={24} color="#667eea" />
                <Text style={styles.detailLabel}>Bedrooms</Text>
                <Text style={styles.detailValue}>{listing.bedrooms}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="shower" size={24} color="#667eea" />
                <Text style={styles.detailLabel}>Bathrooms</Text>
                <Text style={styles.detailValue}>{listing.bathrooms}</Text>
              </View>
              
              {listing.squareFeet && (
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="floor-plan" size={24} color="#667eea" />
                  <Text style={styles.detailLabel}>Size</Text>
                  <Text style={styles.detailValue}>{listing.squareFeet} sq ft</Text>
                </View>
              )}
            </View>
          </View>

          {/* Availability & Pricing */}
          <View style={styles.availabilitySection}>
            <Text style={styles.sectionTitle}>Availability & Pricing</Text>
            
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.dateText}>
                {formatDate(listing.availableFrom)} - {formatDate(listing.availableTo)}
              </Text>
              {listing.flexibleDates && (
                <View style={styles.flexibleBadge}>
                  <Text style={styles.flexibleText}>Flexible</Text>
                </View>
              )}
            </View>
            
            {listing.rentPrice && (
              <View style={styles.pricingContainer}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Monthly Rent</Text>
                  <Text style={styles.priceValue}>${listing.rentPrice}</Text>
                </View>
                {listing.securityDeposit && (
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Security Deposit</Text>
                    <Text style={styles.priceValue}>${listing.securityDeposit}</Text>
                  </View>
                )}
                {listing.utilitiesIncluded && (
                  <View style={styles.utilitiesRow}>
                    <Ionicons name="flash" size={16} color="#27ae60" />
                    <Text style={styles.utilitiesText}>Utilities Included</Text>
                  </View>
                )}
              </View>
            )}
            
            {listing.swapPreferences && listing.listingType !== 'RENT_ONLY' && (
              <View style={styles.swapPreferences}>
                <Text style={styles.preferencesTitle}>Swap Preferences</Text>
                {listing.swapPreferences.lookingFor && listing.swapPreferences.lookingFor.length > 0 && (
                  <Text style={styles.preferencesText}>
                    Looking for: {listing.swapPreferences.lookingFor.join(', ')}
                  </Text>
                )}
                {listing.swapPreferences.preferredLocations && listing.swapPreferences.preferredLocations.length > 0 && (
                  <Text style={styles.preferencesText}>
                    Preferred locations: {listing.swapPreferences.preferredLocations.join(', ')}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </View>

          {/* Amenities */}
          {listing.amenities && Object.keys(listing.amenities).some(key => listing.amenities[key]) && (
            <View style={styles.amenitiesSection}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {listing.amenities.wifi && (
                  <View style={styles.amenityItem}>
                    <Ionicons name="wifi" size={20} color="#667eea" />
                    <Text style={styles.amenityText}>WiFi</Text>
                  </View>
                )}
                {listing.amenities.parking && (
                  <View style={styles.amenityItem}>
                    <Ionicons name="car" size={20} color="#667eea" />
                    <Text style={styles.amenityText}>Parking</Text>
                  </View>
                )}
                {listing.amenities.laundry && (
                  <View style={styles.amenityItem}>
                    <MaterialCommunityIcons name="washing-machine" size={20} color="#667eea" />
                    <Text style={styles.amenityText}>Laundry</Text>
                  </View>
                )}
                {listing.amenities.airConditioning && (
                  <View style={styles.amenityItem}>
                    <MaterialCommunityIcons name="air-conditioner" size={20} color="#667eea" />
                    <Text style={styles.amenityText}>A/C</Text>
                  </View>
                )}
                {listing.amenities.heating && (
                  <View style={styles.amenityItem}>
                    <MaterialCommunityIcons name="radiator" size={20} color="#667eea" />
                    <Text style={styles.amenityText}>Heating</Text>
                  </View>
                )}
                {listing.amenities.furnished && (
                  <View style={styles.amenityItem}>
                    <MaterialCommunityIcons name="sofa" size={20} color="#667eea" />
                    <Text style={styles.amenityText}>Furnished</Text>
                  </View>
                )}
                {listing.amenities.petFriendly && (
                  <View style={styles.amenityItem}>
                    <MaterialCommunityIcons name="paw" size={20} color="#667eea" />
                    <Text style={styles.amenityText}>Pet Friendly</Text>
                  </View>
                )}
                {listing.amenities.kitchen && (
                  <View style={styles.amenityItem}>
                    <MaterialCommunityIcons name="stove" size={20} color="#667eea" />
                    <Text style={styles.amenityText}>Kitchen</Text>
                  </View>
                )}
                {listing.amenities.gym && (
                  <View style={styles.amenityItem}>
                    <MaterialCommunityIcons name="dumbbell" size={20} color="#667eea" />
                    <Text style={styles.amenityText}>Gym</Text>
                  </View>
                )}
                {listing.amenities.pool && (
                  <View style={styles.amenityItem}>
                    <MaterialCommunityIcons name="pool" size={20} color="#667eea" />
                    <Text style={styles.amenityText}>Pool</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* House Rules */}
          {listing.houseRules && listing.houseRules.length > 0 && (
            <View style={styles.rulesSection}>
              <Text style={styles.sectionTitle}>House Rules</Text>
              {listing.houseRules.map((rule: string, index: number) => (
                <View key={index} style={styles.ruleItem}>
                  <Text style={styles.ruleBullet}>•</Text>
                  <Text style={styles.ruleText}>{rule}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Owner Info */}
          <View style={styles.ownerSection}>
            <Text style={styles.sectionTitle}>Listed by</Text>
            <View style={styles.ownerCard}>
              <View style={styles.ownerInfo}>
                {listing.owner.profilePicture ? (
                  <Image source={{ uri: listing.owner.profilePicture }} style={styles.ownerAvatar} />
                ) : (
                  <View style={styles.ownerAvatarPlaceholder}>
                    <Text style={styles.ownerAvatarText}>
                      {listing.owner.fullName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.ownerDetails}>
                  <Text style={styles.ownerName}>{listing.owner.fullName}</Text>
                  <Text style={styles.ownerUniversity}>{listing.owner.university}</Text>
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="shield-checkmark" size={14} color="#27ae60" />
                    <Text style={styles.verifiedText}>Verified Student</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.viewProfileButton}>
                <Text style={styles.viewProfileText}>View Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={20} color="#999" />
              <Text style={styles.statText}>{listing.views} views</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={20} color="#999" />
              <Text style={styles.statText}>{listing.favorites} favorites</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={20} color="#999" />
              <Text style={styles.statText}>Listed {formatDate(listing.createdAt)}</Text>
            </View>
          </View>

          {/* Report Button */}
          <TouchableOpacity style={styles.reportButton} onPress={handleReportListing}>
            <Ionicons name="flag-outline" size={16} color="#999" />
            <Text style={styles.reportText}>Report this listing</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {listing.rentPrice && (
          <View style={styles.priceContainer}>
            <Text style={styles.bottomPrice}>${listing.rentPrice}</Text>
            <Text style={styles.bottomPriceLabel}>/month</Text>
          </View>
        )}
        <TouchableOpacity style={styles.contactButton} onPress={handleContactOwner}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.contactButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="chatbubbles" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>Contact Owner</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#667eea',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  image: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  imageIndicatorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  imageIndicatorActive: {
    backgroundColor: '#fff',
    width: 20,
  },
  headerActions: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 10,
  },
  content: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  swapBadge: {
    backgroundColor: '#e8f4fd',
  },
  rentBadge: {
    backgroundColor: '#fff4e6',
  },
  bothBadge: {
    backgroundColor: '#f0f4ff',
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
    flex: 1,
  },
  universityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  universityText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  distanceText: {
    fontSize: 14,
    color: '#999',
  },
  detailsSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -10,
  },
  detailItem: {
    width: '25%',
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  availabilitySection: {
    marginBottom: 25,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  flexibleBadge: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#e8f4fd',
    borderRadius: 12,
  },
  flexibleText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
  },
  pricingContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  utilitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  utilitiesText: {
    fontSize: 14,
    color: '#27ae60',
    marginLeft: 5,
  },
  swapPreferences: {
    backgroundColor: '#f0f4ff',
    padding: 15,
    borderRadius: 12,
  },
  preferencesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 8,
  },
  preferencesText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  descriptionSection: {
    marginBottom: 25,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  amenitiesSection: {
    marginBottom: 25,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -10,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  amenityText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  rulesSection: {
    marginBottom: 25,
  },
  ruleItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ruleBullet: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  ruleText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  ownerSection: {
    marginBottom: 25,
  },
  ownerCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ownerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  ownerAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  ownerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  ownerUniversity: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#27ae60',
    marginLeft: 4,
  },
  viewProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#667eea',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  viewProfileText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 5,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  reportText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 5,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bottomPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  bottomPriceLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 2,
  },
  contactButton: {
    flex: 1,
    marginLeft: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  contactButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ListingDetailScreen;