import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

let SwapstayNative: any = null;
try {
  SwapstayNative = require('../../modules/swapstay-native/src/SwapstayNativeModule').default;
} catch (e) {
  console.log('Native module not available in Expo Go');
}

interface SearchResult {
  id: string;
  title: string;
  location: string;
  university: string;
  image: string;
  rating: number;
  price: string;
  dates: string;
  verified: boolean;
}

const SearchScreen = () => {
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [university, setUniversity] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    entirePlace: false,
    privateRoom: false,
    sharedRoom: false,
  });

  const searchResults: SearchResult[] = [
    {
      id: '1',
      title: 'Spacious 2BR near Columbia',
      location: 'Morningside Heights, NYC',
      university: 'Columbia University',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
      rating: 4.9,
      price: 'Swap Only',
      dates: 'Available Jun-Aug',
      verified: true,
    },
    {
      id: '2',
      title: 'Studio in Harvard Square',
      location: 'Cambridge, MA',
      university: 'Harvard University',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
      rating: 4.7,
      price: 'Swap Only',
      dates: 'Available May-Jul',
      verified: true,
    },
    {
      id: '3',
      title: 'Modern Loft near Stanford',
      location: 'Palo Alto, CA',
      university: 'Stanford University',
      image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400',
      rating: 4.8,
      price: 'Swap Only',
      dates: 'Available Jun-Sep',
      verified: true,
    },
  ];

  const handleSearch = async () => {
    if (SwapstayNative && Platform.OS === 'ios') {
      await SwapstayNative.triggerHaptic('medium');
    }
  };

  const toggleFilter = (filter: keyof typeof selectedFilters) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  const renderResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity style={styles.resultCard}>
      <Image source={{ uri: item.image }} style={styles.resultImage} />
      <View style={styles.resultContent}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
          {item.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#10b981" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>
        <View style={styles.resultLocation}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        <Text style={styles.universityText}>{item.university}</Text>
        <View style={styles.resultFooter}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.dateText}>{item.dates}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Find Your Perfect Swap</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="location" size={20} color="#6366f1" />
            <TextInput
              style={styles.input}
              placeholder="Where do you want to go?"
              placeholderTextColor="#999"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          <View style={styles.dateRow}>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowStartPicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#6366f1" />
              <Text style={styles.dateText}>
                {startDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowEndPicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#6366f1" />
              <Text style={styles.dateText}>
                {endDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>

          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowStartPicker(false);
                if (date) setStartDate(date);
              }}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowEndPicker(false);
                if (date) setEndDate(date);
              }}
            />
          )}

          <View style={styles.inputContainer}>
            <Ionicons name="school-outline" size={20} color="#6366f1" />
            <TextInput
              style={styles.input}
              placeholder="University (optional)"
              placeholderTextColor="#999"
              value={university}
              onChangeText={setUniversity}
            />
          </View>

          <View style={styles.filters}>
            <Text style={styles.filterTitle}>Type of place</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedFilters.entirePlace && styles.filterChipActive,
                ]}
                onPress={() => toggleFilter('entirePlace')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilters.entirePlace && styles.filterChipTextActive,
                  ]}
                >
                  Entire Place
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedFilters.privateRoom && styles.filterChipActive,
                ]}
                onPress={() => toggleFilter('privateRoom')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilters.privateRoom && styles.filterChipTextActive,
                  ]}
                >
                  Private Room
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedFilters.sharedRoom && styles.filterChipActive,
                ]}
                onPress={() => toggleFilter('sharedRoom')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilters.sharedRoom && styles.filterChipTextActive,
                  ]}
                >
                  Shared Room
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search Swaps</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>
            {searchResults.length} Swaps Available
          </Text>
          <FlatList
            data={searchResults}
            renderItem={renderResult}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
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
  searchSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginHorizontal: 5,
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  filters: {
    marginVertical: 15,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  searchButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsSection: {
    padding: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resultImage: {
    width: 120,
    height: 120,
  },
  resultContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  verifiedText: {
    fontSize: 11,
    color: '#10b981',
    marginLeft: 4,
    fontWeight: '600',
  },
  resultLocation: {
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
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  separator: {
    height: 15,
  },
});

export default SearchScreen;