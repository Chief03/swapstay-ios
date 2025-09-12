import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

interface FilterScreenProps {
  navigation: any;
  route: any;
}

const FilterScreen: React.FC<FilterScreenProps> = ({ navigation, route }) => {
  const { theme, isDarkMode } = useTheme();
  const { onApplyFilters } = route.params || {};
  
  // Filter States
  const [listingType, setListingType] = useState<'all' | 'swap' | 'rent' | 'both'>('all');
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [bedrooms, setBedrooms] = useState<number | null>(null);
  const [bathrooms, setBathrooms] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [university, setUniversity] = useState('');
  const [city, setCity] = useState('');
  
  // Amenities
  const [amenities, setAmenities] = useState({
    furnished: false,
    parking: false,
    wifi: false,
    laundry: false,
    kitchen: false,
    airConditioning: false,
    heating: false,
    gym: false,
    pool: false,
    petFriendly: false,
  });

  const propertyTypeOptions = [
    { id: 'apartment', label: 'Apartment', icon: 'office-building' },
    { id: 'house', label: 'House', icon: 'home' },
    { id: 'studio', label: 'Studio', icon: 'floor-plan' },
    { id: 'condo', label: 'Condo', icon: 'city' },
    { id: 'townhouse', label: 'Townhouse', icon: 'home-group' },
    { id: 'loft', label: 'Loft', icon: 'home-city' },
  ];

  const listingTypeOptions = [
    { id: 'all', label: 'All', color: theme.colors.primary },
    { id: 'swap', label: 'Swap Only', color: '#10B981' },
    { id: 'rent', label: 'Rent Only', color: '#3B82F6' },
    { id: 'both', label: 'Both', color: theme.colors.secondary },
  ];

  const togglePropertyType = (type: string) => {
    setPropertyTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const toggleAmenity = (amenity: keyof typeof amenities) => {
    setAmenities(prev => ({
      ...prev,
      [amenity]: !prev[amenity],
    }));
  };

  const handleApplyFilters = () => {
    const filters = {
      listingType: listingType !== 'all' ? listingType : undefined,
      propertyTypes: propertyTypes.length > 0 ? propertyTypes : undefined,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 5000 ? priceRange[1] : undefined,
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      university: university || undefined,
      city: city || undefined,
      amenities: Object.entries(amenities)
        .filter(([_, value]) => value)
        .map(([key, _]) => key),
    };

    // Remove undefined values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined)
    );

    if (onApplyFilters) {
      onApplyFilters(cleanFilters);
    }
    
    navigation.goBack();
  };

  const handleResetFilters = () => {
    setListingType('all');
    setPropertyTypes([]);
    setPriceRange([0, 5000]);
    setBedrooms(null);
    setBathrooms(null);
    setStartDate(new Date());
    setEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    setUniversity('');
    setCity('');
    setAmenities({
      furnished: false,
      parking: false,
      wifi: false,
      laundry: false,
      kitchen: false,
      airConditioning: false,
      heating: false,
      gym: false,
      pool: false,
      petFriendly: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Filters</Text>
        <TouchableOpacity onPress={handleResetFilters}>
          <Text style={[styles.resetText, { color: theme.colors.primary }]}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Listing Type */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Listing Type</Text>
          <View style={styles.optionRow}>
            {listingTypeOptions.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.typeChip,
                  { 
                    backgroundColor: listingType === option.id 
                      ? option.color 
                      : theme.colors.surfaceVariant,
                    borderColor: listingType === option.id 
                      ? option.color 
                      : theme.colors.outline,
                  }
                ]}
                onPress={() => setListingType(option.id as any)}
              >
                <Text style={[
                  styles.typeChipText,
                  { 
                    color: listingType === option.id 
                      ? '#fff' 
                      : theme.colors.onSurface 
                  }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Property Type */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Property Type</Text>
          <View style={styles.propertyGrid}>
            {propertyTypeOptions.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.propertyCard,
                  { 
                    backgroundColor: propertyTypes.includes(option.id)
                      ? theme.colors.primaryContainer
                      : theme.colors.surfaceVariant,
                    borderColor: propertyTypes.includes(option.id)
                      ? theme.colors.primary
                      : theme.colors.outline,
                  }
                ]}
                onPress={() => togglePropertyType(option.id)}
              >
                <MaterialCommunityIcons 
                  name={option.icon as any} 
                  size={24} 
                  color={propertyTypes.includes(option.id) ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />
                <Text style={[
                  styles.propertyCardText,
                  { color: theme.colors.onSurface }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price Range (for Rent) */}
        {(listingType === 'rent' || listingType === 'both' || listingType === 'all') && (
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Price Range (Monthly)
            </Text>
            <View style={styles.priceContainer}>
              <Text style={[styles.priceLabel, { color: theme.colors.onSurface }]}>
                ${priceRange[0]}
              </Text>
              <Text style={[styles.priceLabel, { color: theme.colors.onSurface }]}>
                ${priceRange[1]}+
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={5000}
              step={100}
              value={priceRange[0]}
              onValueChange={(value) => setPriceRange([value, priceRange[1]])}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.outline}
              thumbTintColor={theme.colors.primary}
            />
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={5000}
              step={100}
              value={priceRange[1]}
              onValueChange={(value) => setPriceRange([priceRange[0], value])}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.outline}
              thumbTintColor={theme.colors.primary}
            />
          </View>
        )}

        {/* Rooms */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Rooms</Text>
          
          <View style={styles.roomRow}>
            <Text style={[styles.roomLabel, { color: theme.colors.onSurfaceVariant }]}>Bedrooms</Text>
            <View style={styles.roomButtons}>
              {[null, 1, 2, 3, 4, '5+'].map((num) => (
                <TouchableOpacity
                  key={String(num)}
                  style={[
                    styles.roomButton,
                    {
                      backgroundColor: bedrooms === num || (bedrooms === 5 && num === '5+')
                        ? theme.colors.primary
                        : theme.colors.surfaceVariant,
                    }
                  ]}
                  onPress={() => setBedrooms(num === '5+' ? 5 : num as any)}
                >
                  <Text style={[
                    styles.roomButtonText,
                    {
                      color: bedrooms === num || (bedrooms === 5 && num === '5+')
                        ? '#fff'
                        : theme.colors.onSurface,
                    }
                  ]}>
                    {num === null ? 'Any' : num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.roomRow}>
            <Text style={[styles.roomLabel, { color: theme.colors.onSurfaceVariant }]}>Bathrooms</Text>
            <View style={styles.roomButtons}>
              {[null, 1, 2, 3, '4+'].map((num) => (
                <TouchableOpacity
                  key={String(num)}
                  style={[
                    styles.roomButton,
                    {
                      backgroundColor: bathrooms === num || (bathrooms === 4 && num === '4+')
                        ? theme.colors.primary
                        : theme.colors.surfaceVariant,
                    }
                  ]}
                  onPress={() => setBathrooms(num === '4+' ? 4 : num as any)}
                >
                  <Text style={[
                    styles.roomButtonText,
                    {
                      color: bathrooms === num || (bathrooms === 4 && num === '4+')
                        ? '#fff'
                        : theme.colors.onSurface,
                    }
                  ]}>
                    {num === null ? 'Any' : num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Dates */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Availability</Text>
          
          <View style={styles.dateContainer}>
            <TouchableOpacity
              style={[styles.dateCard, { 
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: showStartPicker ? theme.colors.primary : 'transparent',
                borderWidth: showStartPicker ? 2 : 0
              }]}
              onPress={() => setShowStartPicker(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.dateIconBox, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name="calendar" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.dateInfo}>
                <Text style={[styles.dateLabel, { color: theme.colors.onSurfaceVariant }]}>
                  CHECK-IN
                </Text>
                <Text style={[styles.dateDay, { color: theme.colors.onSurface }]}>
                  {startDate.getDate()}
                </Text>
                <Text style={[styles.dateMonth, { color: theme.colors.onSurfaceVariant }]}>
                  {startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.dateDivider}>
              <Ionicons name="arrow-forward" size={20} color={theme.colors.onSurfaceVariant} />
            </View>

            <TouchableOpacity
              style={[styles.dateCard, { 
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: showEndPicker ? theme.colors.primary : 'transparent',
                borderWidth: showEndPicker ? 2 : 0
              }]}
              onPress={() => setShowEndPicker(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.dateIconBox, { backgroundColor: theme.colors.secondary + '20' }]}>
                <Ionicons name="calendar" size={24} color={theme.colors.secondary} />
              </View>
              <View style={styles.dateInfo}>
                <Text style={[styles.dateLabel, { color: theme.colors.onSurfaceVariant }]}>
                  CHECK-OUT
                </Text>
                <Text style={[styles.dateDay, { color: theme.colors.onSurface }]}>
                  {endDate.getDate()}
                </Text>
                <Text style={[styles.dateMonth, { color: theme.colors.onSurfaceVariant }]}>
                  {endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={[styles.durationBadge, { backgroundColor: theme.colors.primaryContainer }]}>
            <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
            <Text style={[styles.durationText, { color: theme.colors.primary }]}>
              {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
            </Text>
          </View>
        </View>

        {/* Location */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Location</Text>
          
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Ionicons name="school-outline" size={20} color={theme.colors.onSurfaceVariant} />
            <TextInput
              style={[styles.input, { color: theme.colors.onSurface }]}
              placeholder="University name..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={university}
              onChangeText={setUniversity}
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Ionicons name="location-outline" size={20} color={theme.colors.onSurfaceVariant} />
            <TextInput
              style={[styles.input, { color: theme.colors.onSurface }]}
              placeholder="City..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={city}
              onChangeText={setCity}
            />
          </View>
        </View>

        {/* Amenities */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Amenities</Text>
          
          {Object.entries({
            furnished: { label: 'Furnished', icon: 'sofa' },
            parking: { label: 'Parking', icon: 'car' },
            wifi: { label: 'WiFi', icon: 'wifi' },
            laundry: { label: 'Laundry', icon: 'washing-machine' },
            kitchen: { label: 'Kitchen', icon: 'fridge' },
            airConditioning: { label: 'AC', icon: 'air-conditioner' },
            heating: { label: 'Heating', icon: 'fire' },
            gym: { label: 'Gym', icon: 'dumbbell' },
            pool: { label: 'Pool', icon: 'pool' },
            petFriendly: { label: 'Pet Friendly', icon: 'paw' },
          }).map(([key, config]) => (
            <View key={key} style={styles.amenityRow}>
              <View style={styles.amenityLeft}>
                <MaterialCommunityIcons 
                  name={config.icon as any} 
                  size={20} 
                  color={theme.colors.onSurfaceVariant} 
                />
                <Text style={[styles.amenityText, { color: theme.colors.onSurface }]}>
                  {config.label}
                </Text>
              </View>
              <Switch
                value={amenities[key as keyof typeof amenities]}
                onValueChange={() => toggleAmenity(key as keyof typeof amenities)}
                trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
                thumbColor={theme.colors.surface}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApplyFilters}
        >
          <LinearGradient
            colors={isDarkMode ? [theme.colors.primary, theme.colors.secondary] : ['#667eea', '#764ba2']}
            style={styles.applyGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.applyText}>Apply Filters</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Date Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) {
              setStartDate(selectedDate);
            }
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate) {
              setEndDate(selectedDate);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  resetText: {
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  propertyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  propertyCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  propertyCardText: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  roomRow: {
    marginBottom: 15,
  },
  roomLabel: {
    fontSize: 14,
    marginBottom: 10,
  },
  roomButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  roomButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  roomButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
  },
  dateIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  dateDay: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  dateMonth: {
    fontSize: 12,
  },
  dateDivider: {
    marginHorizontal: 10,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 15,
    fontSize: 16,
  },
  amenityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  amenityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amenityText: {
    fontSize: 16,
    marginLeft: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  applyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  applyGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  applyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FilterScreen;