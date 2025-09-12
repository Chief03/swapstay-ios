import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/api';

interface RequestModalProps {
  visible: boolean;
  onClose: () => void;
  listing: any;
  onSuccess: () => void;
}

interface UserListing {
  _id: string;
  title: string;
  propertyType: string;
  listingType: string;
  photos?: string[];
  address: {
    city: string;
    state: string;
  };
  bedrooms: number;
  bathrooms: number;
  rentPrice?: number;
}

const RequestModal: React.FC<RequestModalProps> = ({
  visible,
  onClose,
  listing,
  onSuccess,
}) => {
  const { isDarkMode } = useTheme();
  const [requestType, setRequestType] = useState<'SWAP' | 'RENT'>('SWAP');
  const [selectedListing, setSelectedListing] = useState<UserListing | null>(null);
  const [userListings, setUserListings] = useState<UserListing[]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 days from now
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [message, setMessage] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingListings, setLoadingListings] = useState(false);

  useEffect(() => {
    if (visible && listing) {
      // Set default request type based on listing type
      if (listing.listingType === 'RENT_ONLY') {
        setRequestType('RENT');
      } else {
        setRequestType('SWAP');
      }
      
      // Set default message
      setMessage(`Hi! I'm interested in your ${listing.title}. Let's discuss the details!`);
      
      // Set default price if it's a rent listing
      if (listing.rentPrice) {
        setProposedPrice(listing.rentPrice.toString());
      }
      
      // Load user's listings for swap requests
      loadUserListings();
    }
  }, [visible, listing]);

  const loadUserListings = async () => {
    try {
      setLoadingListings(true);
      const response = await apiService.getUserListings();
      if (response.success) {
        // Filter out the current listing
        const filteredListings = response.listings?.filter(
          (l: UserListing) => l._id !== listing._id
        ) || [];
        setUserListings(filteredListings);
      }
    } catch (error) {
      console.error('Error loading user listings:', error);
    } finally {
      setLoadingListings(false);
    }
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please add a message for the property owner');
      return;
    }

    if (requestType === 'SWAP' && !selectedListing) {
      Alert.alert('Error', 'Please select one of your listings to offer for the swap');
      return;
    }

    if (requestType === 'RENT' && !proposedPrice.trim()) {
      Alert.alert('Error', 'Please enter your proposed price');
      return;
    }

    if (endDate <= startDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    try {
      setLoading(true);
      
      const requestData = {
        requestType,
        targetListingId: listing._id,
        requesterListingId: requestType === 'SWAP' ? selectedListing?._id : undefined,
        requestedDates: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        message: message.trim(),
        proposedPrice: requestType === 'RENT' ? Number(proposedPrice) : undefined,
      };

      const response = await apiService.createSwapRequest(requestData);
      
      if (response.success) {
        Alert.alert(
          'Request Sent! 🎉',
          `Your ${requestType.toLowerCase()} request has been sent to the property owner. They'll be notified and can respond directly.`,
          [
            {
              text: 'View in Messages',
              onPress: () => {
                onClose();
                onSuccess();
                // Navigate to messages - this could be handled by parent component
              }
            },
            {
              text: 'OK',
              onPress: () => {
                onClose();
                onSuccess();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to send request');
      }
    } catch (error) {
      console.error('Error sending request:', error);
      Alert.alert('Error', 'Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderListingOption = ({ item }: { item: UserListing }) => (
    <TouchableOpacity
      style={[
        styles.listingOption,
        selectedListing?._id === item._id && styles.selectedListing,
        isDarkMode && styles.listingOptionDark
      ]}
      onPress={() => setSelectedListing(item)}
    >
      <View style={styles.listingOptionContent}>
        <View style={styles.listingInfo}>
          <Text style={[styles.listingTitle, isDarkMode && styles.listingTitleDark]}>
            {item.title}
          </Text>
          <Text style={[styles.listingDetails, isDarkMode && styles.listingDetailsDark]}>
            {item.propertyType} • {item.bedrooms}br/{item.bathrooms}ba
          </Text>
          <Text style={[styles.listingLocation, isDarkMode && styles.listingLocationDark]}>
            {item.address.city}, {item.address.state}
          </Text>
        </View>
        <View style={styles.selectionIndicator}>
          {selectedListing?._id === item._id && (
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!listing) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, isDarkMode && styles.containerDark]}>
        {/* Header */}
        <View style={[styles.header, isDarkMode && styles.headerDark]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={isDarkMode ? '#e2e8f0' : '#333'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>
            Send Request
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Request Type Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
              Request Type
            </Text>
            <View style={styles.typeSelection}>
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  requestType === 'SWAP' && styles.selectedType,
                  isDarkMode && styles.typeOptionDark,
                  requestType === 'SWAP' && isDarkMode && styles.selectedTypeDark
                ]}
                onPress={() => setRequestType('SWAP')}
                disabled={listing.listingType === 'RENT_ONLY'}
              >
                <Ionicons 
                  name="swap-horizontal" 
                  size={20} 
                  color={requestType === 'SWAP' ? '#fff' : (isDarkMode ? '#94a3b8' : '#666')} 
                />
                <Text style={[
                  styles.typeText,
                  requestType === 'SWAP' && styles.selectedTypeText,
                  isDarkMode && styles.typeTextDark,
                  requestType === 'SWAP' && isDarkMode && styles.selectedTypeTextDark
                ]}>
                  Property Swap
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  requestType === 'RENT' && styles.selectedType,
                  isDarkMode && styles.typeOptionDark,
                  requestType === 'RENT' && isDarkMode && styles.selectedTypeDark
                ]}
                onPress={() => setRequestType('RENT')}
                disabled={listing.listingType === 'SWAP_ONLY'}
              >
                <Ionicons 
                  name="cash" 
                  size={20} 
                  color={requestType === 'RENT' ? '#fff' : (isDarkMode ? '#94a3b8' : '#666')} 
                />
                <Text style={[
                  styles.typeText,
                  requestType === 'RENT' && styles.selectedTypeText,
                  isDarkMode && styles.typeTextDark,
                  requestType === 'RENT' && isDarkMode && styles.selectedTypeTextDark
                ]}>
                  Rent Only
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Property Selection for Swaps */}
          {requestType === 'SWAP' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
                Select Your Property to Offer
              </Text>
              {loadingListings ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#6366f1" />
                  <Text style={[styles.loadingText, isDarkMode && styles.loadingTextDark]}>
                    Loading your listings...
                  </Text>
                </View>
              ) : userListings.length === 0 ? (
                <View style={[styles.emptyState, isDarkMode && styles.emptyStateDark]}>
                  <Ionicons name="home-outline" size={32} color="#999" />
                  <Text style={[styles.emptyStateText, isDarkMode && styles.emptyStateTextDark]}>
                    You don't have any listings to offer for a swap.
                  </Text>
                  <Text style={[styles.emptyStateSubtext, isDarkMode && styles.emptyStateSubtextDark]}>
                    Create a listing first, then you can propose swaps!
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={userListings}
                  renderItem={renderListingOption}
                  keyExtractor={(item) => item._id}
                  showsVerticalScrollIndicator={false}
                  style={styles.listingsList}
                />
              )}
            </View>
          )}

          {/* Price Input for Rent */}
          {requestType === 'RENT' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
                Proposed Monthly Rent
              </Text>
              <View style={[styles.priceInputContainer, isDarkMode && styles.priceInputContainerDark]}>
                <Text style={[styles.pricePrefix, isDarkMode && styles.pricePrefixDark]}>$</Text>
                <TextInput
                  style={[styles.priceInput, isDarkMode && styles.priceInputDark]}
                  value={proposedPrice}
                  onChangeText={setProposedPrice}
                  placeholder="2500"
                  placeholderTextColor={isDarkMode ? '#64748b' : '#999'}
                  keyboardType="numeric"
                />
                <Text style={[styles.priceSuffix, isDarkMode && styles.priceSuffixDark]}>/month</Text>
              </View>
            </View>
          )}

          {/* Date Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
              Requested Dates
            </Text>
            <View style={styles.dateSelection}>
              <TouchableOpacity
                style={[styles.dateButton, isDarkMode && styles.dateButtonDark]}
                onPress={() => setShowStartPicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#6366f1" />
                <View style={styles.dateInfo}>
                  <Text style={[styles.dateLabel, isDarkMode && styles.dateLabelDark]}>From</Text>
                  <Text style={[styles.dateValue, isDarkMode && styles.dateValueDark]}>
                    {formatDate(startDate)}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dateButton, isDarkMode && styles.dateButtonDark]}
                onPress={() => setShowEndPicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#6366f1" />
                <View style={styles.dateInfo}>
                  <Text style={[styles.dateLabel, isDarkMode && styles.dateLabelDark]}>To</Text>
                  <Text style={[styles.dateValue, isDarkMode && styles.dateValueDark]}>
                    {formatDate(endDate)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Message */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
              Message to Owner
            </Text>
            <TextInput
              style={[styles.messageInput, isDarkMode && styles.messageInputDark]}
              value={message}
              onChangeText={setMessage}
              placeholder="Tell them why you're interested and any questions you have..."
              placeholderTextColor={isDarkMode ? '#64748b' : '#999'}
              multiline
              numberOfLines={4}
              maxLength={1000}
            />
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={[styles.footer, isDarkMode && styles.footerDark]}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.submitButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>
                    Send {requestType === 'SWAP' ? 'Swap' : 'Rent'} Request
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Date Pickers */}
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartPicker(false);
              if (selectedDate) {
                setStartDate(selectedDate);
                // Ensure end date is after start date
                if (selectedDate >= endDate) {
                  setEndDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000));
                }
              }
            }}
            minimumDate={new Date()}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowEndPicker(false);
              if (selectedDate) {
                setEndDate(selectedDate);
              }
            }}
            minimumDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerDark: {
    backgroundColor: '#1e293b',
    borderBottomColor: '#334155',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  headerTitleDark: {
    color: '#e2e8f0',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: '#e2e8f0',
  },
  typeSelection: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeOptionDark: {
    backgroundColor: '#1e293b',
  },
  selectedType: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  selectedTypeDark: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  typeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  typeTextDark: {
    color: '#94a3b8',
  },
  selectedTypeText: {
    color: '#fff',
  },
  selectedTypeTextDark: {
    color: '#fff',
  },
  listingsList: {
    maxHeight: 300,
  },
  listingOption: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  listingOptionDark: {
    backgroundColor: '#1e293b',
  },
  selectedListing: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  listingOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  listingTitleDark: {
    color: '#e2e8f0',
  },
  listingDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  listingDetailsDark: {
    color: '#94a3b8',
  },
  listingLocation: {
    fontSize: 13,
    color: '#999',
  },
  listingLocationDark: {
    color: '#64748b',
  },
  selectionIndicator: {
    marginLeft: 12,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  priceInputContainerDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  pricePrefix: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 4,
  },
  pricePrefixDark: {
    color: '#e2e8f0',
  },
  priceInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  priceInputDark: {
    color: '#e2e8f0',
  },
  priceSuffix: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  priceSuffixDark: {
    color: '#94a3b8',
  },
  dateSelection: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
  },
  dateButtonDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  dateInfo: {
    marginLeft: 12,
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  dateLabelDark: {
    color: '#94a3b8',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dateValueDark: {
    color: '#e2e8f0',
  },
  messageInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  messageInputDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    color: '#e2e8f0',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerDark: {
    backgroundColor: '#1e293b',
    borderTopColor: '#334155',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  submitButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  loadingTextDark: {
    color: '#94a3b8',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyStateDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyStateTextDark: {
    color: '#e2e8f0',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyStateSubtextDark: {
    color: '#94a3b8',
  },
});

export default RequestModal;