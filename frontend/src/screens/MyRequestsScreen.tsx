import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/api';

interface SwapRequest {
  _id: string;
  requestType: 'SWAP' | 'RENT';
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED';
  requester: {
    _id: string;
    fullName: string;
    university: string;
    profilePicture?: string;
  };
  targetListing: {
    _id: string;
    title: string;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    photos: string[];
    address: {
      city: string;
      state: string;
    };
    rentPrice?: number;
  };
  requesterListing?: {
    _id: string;
    title: string;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    photos: string[];
    address: {
      city: string;
      state: string;
    };
  };
  requestedDates: {
    startDate: string;
    endDate: string;
  };
  message: string;
  proposedPrice?: number;
  compatibilityScore?: {
    overallScore: number;
    factors: {
      dateOverlap: number;
      distanceMatch: number;
      propertyTypeMatch: number;
      universityMatch: number;
    };
    insights: string[];
  };
  createdAt: string;
  expiresAt: string;
}

const MyRequestsScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('received');
  const [sentRequests, setSentRequests] = useState<SwapRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      
      // Load both sent and received requests in parallel
      const [sentResponse, receivedResponse] = await Promise.all([
        apiService.getUserSwapRequests('sent'),
        apiService.getUserSwapRequests('received')
      ]);

      if (sentResponse.success) {
        setSentRequests(sentResponse.data?.requests || []);
      }

      if (receivedResponse.success) {
        setReceivedRequests(receivedResponse.data?.requests || []);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      Alert.alert('Error', 'Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await apiService.respondToSwapRequest(requestId, 'ACCEPT', 'Accepted your request!');
      
      if (response.success) {
        Alert.alert(
          'Request Accepted! 🎉',
          'You\'ve accepted the request. You can now chat with the requester to finalize details.',
          [
            {
              text: 'View Messages',
              onPress: () => {
                // Navigate to messages
                navigation.navigate('Messages' as never);
              }
            },
            { text: 'OK' }
          ]
        );
        
        // Refresh requests
        loadRequests();
      } else {
        Alert.alert('Error', response.message || 'Failed to accept request');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', 'Failed to accept request. Please try again.');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    Alert.alert(
      'Decline Request',
      'Are you sure you want to decline this request? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.respondToSwapRequest(requestId, 'DECLINE', 'Thank you for your interest, but I\'ve decided to go with another option.');
              
              if (response.success) {
                Alert.alert('Request Declined', 'The request has been declined.');
                loadRequests();
              } else {
                Alert.alert('Error', response.message || 'Failed to decline request');
              }
            } catch (error) {
              console.error('Error declining request:', error);
              Alert.alert('Error', 'Failed to decline request. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleCancelRequest = async (requestId: string) => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.cancelSwapRequest(requestId);
              
              if (response.success) {
                Alert.alert('Request Cancelled', 'Your request has been cancelled.');
                loadRequests();
              } else {
                Alert.alert('Error', response.message || 'Failed to cancel request');
              }
            } catch (error) {
              console.error('Error cancelling request:', error);
              Alert.alert('Error', 'Failed to cancel request. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#f59e0b';
      case 'ACCEPTED':
        return '#10b981';
      case 'DECLINED':
        return '#ef4444';
      case 'CANCELLED':
        return '#6b7280';
      case 'EXPIRED':
        return '#9ca3af';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'ACCEPTED':
        return 'Accepted';
      case 'DECLINED':
        return 'Declined';
      case 'CANCELLED':
        return 'Cancelled';
      case 'EXPIRED':
        return 'Expired';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCompatibilityScoreColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#059669';
    if (score >= 70) return '#f59e0b';
    if (score >= 60) return '#d97706';
    return '#ef4444';
  };

  const renderRequestCard = (request: SwapRequest, type: 'sent' | 'received') => {
    const isExpiringSoon = new Date(request.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000;
    const daysUntilExpiry = Math.ceil((new Date(request.expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000));

    return (
      <View key={request._id} style={[styles.requestCard, isDarkMode && styles.requestCardDark]}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
          <Text style={styles.statusText}>{getStatusText(request.status)}</Text>
        </View>

        {/* Request Type Badge */}
        <View style={[styles.typeBadge, isDarkMode && styles.typeBadgeDark]}>
          <Ionicons 
            name={request.requestType === 'SWAP' ? 'swap-horizontal' : 'cash'} 
            size={14} 
            color={isDarkMode ? '#e2e8f0' : '#333'} 
          />
          <Text style={[styles.typeText, isDarkMode && styles.typeTextDark]}>
            {request.requestType === 'SWAP' ? 'Property Swap' : 'Rent Request'}
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.cardContent}>
          {/* Target Property */}
          <View style={styles.propertySection}>
            <View style={styles.propertyHeader}>
              <Text style={[styles.propertyLabel, isDarkMode && styles.propertyLabelDark]}>
                {type === 'sent' ? 'Requested Property' : 'Your Property'}
              </Text>
              {request.compatibilityScore && (
                <View style={[styles.scoreContainer, { backgroundColor: getCompatibilityScoreColor(request.compatibilityScore.overallScore) }]}>
                  <Text style={styles.scoreText}>{request.compatibilityScore.overallScore}%</Text>
                </View>
              )}
            </View>
            
            <View style={styles.propertyInfo}>
              {request.targetListing.photos.length > 0 && (
                <Image
                  source={{ uri: request.targetListing.photos[0] }}
                  style={styles.propertyImage}
                />
              )}
              <View style={styles.propertyDetails}>
                <Text style={[styles.propertyTitle, isDarkMode && styles.propertyTitleDark]}>
                  {request.targetListing.title}
                </Text>
                <Text style={[styles.propertySpecs, isDarkMode && styles.propertySpecsDark]}>
                  {request.targetListing.propertyType} • {request.targetListing.bedrooms}br/{request.targetListing.bathrooms}ba
                </Text>
                <Text style={[styles.propertyLocation, isDarkMode && styles.propertyLocationDark]}>
                  {request.targetListing.address.city}, {request.targetListing.address.state}
                </Text>
                {request.targetListing.rentPrice && (
                  <Text style={[styles.propertyPrice, isDarkMode && styles.propertyPriceDark]}>
                    ${request.targetListing.rentPrice}/month
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Requester Listing for Swaps */}
          {request.requestType === 'SWAP' && request.requesterListing && (
            <View style={[styles.propertySection, styles.swapPropertySection]}>
              <Text style={[styles.propertyLabel, isDarkMode && styles.propertyLabelDark]}>
                {type === 'sent' ? 'Your Offered Property' : 'Offered Property'}
              </Text>
              
              <View style={styles.propertyInfo}>
                {request.requesterListing.photos.length > 0 && (
                  <Image
                    source={{ uri: request.requesterListing.photos[0] }}
                    style={styles.propertyImage}
                  />
                )}
                <View style={styles.propertyDetails}>
                  <Text style={[styles.propertyTitle, isDarkMode && styles.propertyTitleDark]}>
                    {request.requesterListing.title}
                  </Text>
                  <Text style={[styles.propertySpecs, isDarkMode && styles.propertySpecsDark]}>
                    {request.requesterListing.propertyType} • {request.requesterListing.bedrooms}br/{request.requesterListing.bathrooms}ba
                  </Text>
                  <Text style={[styles.propertyLocation, isDarkMode && styles.propertyLocationDark]}>
                    {request.requesterListing.address.city}, {request.requesterListing.address.state}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Request Details */}
          <View style={styles.requestDetails}>
            <View style={styles.dateSection}>
              <Text style={[styles.detailLabel, isDarkMode && styles.detailLabelDark]}>Requested Dates:</Text>
              <Text style={[styles.detailValue, isDarkMode && styles.detailValueDark]}>
                {formatDate(request.requestedDates.startDate)} - {formatDate(request.requestedDates.endDate)}
              </Text>
            </View>

            {request.proposedPrice && (
              <View style={styles.priceSection}>
                <Text style={[styles.detailLabel, isDarkMode && styles.detailLabelDark]}>Proposed Price:</Text>
                <Text style={[styles.detailValue, isDarkMode && styles.detailValueDark]}>
                  ${request.proposedPrice}/month
                </Text>
              </View>
            )}

            {type === 'received' && (
              <View style={styles.requesterSection}>
                <Text style={[styles.detailLabel, isDarkMode && styles.detailLabelDark]}>From:</Text>
                <Text style={[styles.detailValue, isDarkMode && styles.detailValueDark]}>
                  {request.requester.fullName} ({request.requester.university})
                </Text>
              </View>
            )}

            <View style={styles.messageSection}>
              <Text style={[styles.detailLabel, isDarkMode && styles.detailLabelDark]}>Message:</Text>
              <Text style={[styles.messageText, isDarkMode && styles.messageTextDark]}>
                {request.message}
              </Text>
            </View>

            {/* Compatibility Insights */}
            {request.compatibilityScore && request.compatibilityScore.insights.length > 0 && (
              <View style={styles.insightsSection}>
                <Text style={[styles.detailLabel, isDarkMode && styles.detailLabelDark]}>Match Insights:</Text>
                <View style={styles.insightsList}>
                  {request.compatibilityScore.insights.map((insight, index) => (
                    <Text key={index} style={[styles.insightText, isDarkMode && styles.insightTextDark]}>
                      • {insight}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* Expiry Warning */}
            {request.status === 'PENDING' && isExpiringSoon && (
              <View style={styles.expiryWarning}>
                <Ionicons name="time-outline" size={16} color="#ef4444" />
                <Text style={styles.expiryText}>
                  Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          {request.status === 'PENDING' && (
            <View style={styles.actionButtons}>
              {type === 'received' ? (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.declineButton]}
                    onPress={() => handleDeclineRequest(request._id)}
                  >
                    <Ionicons name="close" size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>Decline</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleAcceptRequest(request._id)}
                  >
                    <Ionicons name="checkmark" size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>Accept</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => handleCancelRequest(request._id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                  <Text style={styles.actionButtonText}>Cancel Request</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const currentRequests = activeTab === 'sent' ? sentRequests : receivedRequests;

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#e2e8f0' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>
          My Requests
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, isDarkMode && styles.tabContainerDark]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'received' && styles.activeTab,
            isDarkMode && styles.tabDark,
            activeTab === 'received' && isDarkMode && styles.activeTabDark
          ]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'received' && styles.activeTabText,
            isDarkMode && styles.tabTextDark,
            activeTab === 'received' && isDarkMode && styles.activeTabTextDark
          ]}>
            Received ({receivedRequests.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'sent' && styles.activeTab,
            isDarkMode && styles.tabDark,
            activeTab === 'sent' && isDarkMode && styles.activeTabDark
          ]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'sent' && styles.activeTabText,
            isDarkMode && styles.tabTextDark,
            activeTab === 'sent' && isDarkMode && styles.activeTabTextDark
          ]}>
            Sent ({sentRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={[styles.loadingText, isDarkMode && styles.loadingTextDark]}>
            Loading requests...
          </Text>
        </View>
      ) : currentRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name={activeTab === 'sent' ? 'paper-plane-outline' : 'mail-outline'} 
            size={48} 
            color="#999" 
          />
          <Text style={[styles.emptyTitle, isDarkMode && styles.emptyTitleDark]}>
            No {activeTab === 'sent' ? 'Sent' : 'Received'} Requests
          </Text>
          <Text style={[styles.emptySubtext, isDarkMode && styles.emptySubtextDark]}>
            {activeTab === 'sent' 
              ? 'Start browsing listings to send your first request!'
              : 'Your received requests will appear here when others are interested in your listings.'
            }
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.requestsList}>
            {currentRequests.map(request => renderRequestCard(request, activeTab))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  headerTitleDark: {
    color: '#e2e8f0',
  },
  placeholder: {
    width: 32,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabContainerDark: {
    backgroundColor: '#1e293b',
    borderBottomColor: '#334155',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabDark: {
    backgroundColor: '#1e293b',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#6366f1',
  },
  activeTabDark: {
    borderBottomColor: '#4f46e5',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  tabTextDark: {
    color: '#94a3b8',
  },
  activeTabText: {
    color: '#6366f1',
  },
  activeTabTextDark: {
    color: '#e2e8f0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  loadingTextDark: {
    color: '#94a3b8',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyTitleDark: {
    color: '#e2e8f0',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptySubtextDark: {
    color: '#94a3b8',
  },
  scrollContainer: {
    flex: 1,
  },
  requestsList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  requestCardDark: {
    backgroundColor: '#1e293b',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  typeBadgeDark: {
    backgroundColor: '#374151',
  },
  typeText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  typeTextDark: {
    color: '#e2e8f0',
  },
  cardContent: {
    marginTop: 8,
  },
  propertySection: {
    marginBottom: 20,
  },
  swapPropertySection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 20,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  propertyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  propertyLabelDark: {
    color: '#94a3b8',
  },
  scoreContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  propertyInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  propertyImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  propertyDetails: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  propertyTitleDark: {
    color: '#e2e8f0',
  },
  propertySpecs: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  propertySpecsDark: {
    color: '#94a3b8',
  },
  propertyLocation: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  propertyLocationDark: {
    color: '#64748b',
  },
  propertyPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  propertyPriceDark: {
    color: '#10b981',
  },
  requestDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
  },
  dateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requesterSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  detailLabelDark: {
    color: '#94a3b8',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  detailValueDark: {
    color: '#e2e8f0',
  },
  messageSection: {
    marginTop: 12,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginTop: 4,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#e5e7eb',
  },
  messageTextDark: {
    color: '#e2e8f0',
    borderLeftColor: '#374151',
  },
  insightsSection: {
    marginTop: 12,
  },
  insightsList: {
    marginTop: 4,
  },
  insightText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 2,
  },
  insightTextDark: {
    color: '#94a3b8',
  },
  expiryWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  expiryText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#dc2626',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  declineButton: {
    backgroundColor: '#ef4444',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  actionButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default MyRequestsScreen;