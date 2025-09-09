import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import apiService from '../services/api';

interface CreateListingScreenProps {
  navigation: any;
}

const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: 'Apartment', icon: 'home-city' },
  { value: 'HOUSE', label: 'House', icon: 'home' },
  { value: 'DORM', label: 'Dorm', icon: 'domain' },
  { value: 'STUDIO', label: 'Studio', icon: 'home-floor-0' },
  { value: 'CONDO', label: 'Condo', icon: 'home-modern' },
  { value: 'TOWNHOUSE', label: 'Townhouse', icon: 'home-group' },
];

const LISTING_TYPES = [
  { value: 'BOTH', label: 'Swap or Rent', description: 'Open to both options' },
  { value: 'SWAP_ONLY', label: 'Swap Only', description: 'Looking for exchange only' },
  { value: 'RENT_ONLY', label: 'Rent Only', description: 'Available for rent' },
];

const CreateListingScreen: React.FC<CreateListingScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Step 1: Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [listingType, setListingType] = useState('BOTH');
  
  // Step 2: Property Details
  const [propertyType, setPropertyType] = useState('APARTMENT');
  const [bedrooms, setBedrooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');
  const [squareFeet, setSquareFeet] = useState('');
  
  // Step 3: Location
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [nearUniversity, setNearUniversity] = useState('');
  const [distanceToCampus, setDistanceToCampus] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  
  // Step 4: Availability & Pricing
  const [availableFrom, setAvailableFrom] = useState(new Date());
  const [availableTo, setAvailableTo] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [flexibleDates, setFlexibleDates] = useState(false);
  const [rentPrice, setRentPrice] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [utilitiesIncluded, setUtilitiesIncluded] = useState(false);
  const [minimumStay, setMinimumStay] = useState('7');
  
  // Step 5: Amenities
  const [amenities, setAmenities] = useState({
    wifi: false,
    parking: false,
    laundry: false,
    airConditioning: false,
    heating: false,
    furnished: false,
    petFriendly: false,
    kitchen: false,
    gym: false,
    pool: false,
  });

  const totalSteps = 5;

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!title || title.length < 10) {
          Alert.alert('Error', 'Title must be at least 10 characters');
          return false;
        }
        if (!description || description.length < 50) {
          Alert.alert('Error', 'Description must be at least 50 characters');
          return false;
        }
        return true;
      
      case 2:
        if (!bedrooms || parseInt(bedrooms) < 0) {
          Alert.alert('Error', 'Please enter valid number of bedrooms');
          return false;
        }
        if (!bathrooms || parseInt(bathrooms) < 0) {
          Alert.alert('Error', 'Please enter valid number of bathrooms');
          return false;
        }
        return true;
      
      case 3:
        if (!street || !city || !state || !zipCode) {
          Alert.alert('Error', 'Please fill in all address fields');
          return false;
        }
        if (!nearUniversity) {
          Alert.alert('Error', 'Please enter the nearest university');
          return false;
        }
        if (!distanceToCampus || parseFloat(distanceToCampus) < 0) {
          Alert.alert('Error', 'Please enter valid distance to campus');
          return false;
        }
        return true;
      
      case 4:
        if (availableTo <= availableFrom) {
          Alert.alert('Error', 'End date must be after start date');
          return false;
        }
        if (listingType !== 'SWAP_ONLY' && (!rentPrice || parseFloat(rentPrice) <= 0)) {
          Alert.alert('Error', 'Please enter a valid rent price');
          return false;
        }
        return true;
      
      case 5:
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const listingData = {
        title,
        description,
        listingType,
        propertyType,
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        squareFeet: squareFeet ? parseInt(squareFeet) : undefined,
        address: {
          street,
          city,
          state,
          zipCode,
        },
        nearUniversity,
        distanceToCampus: parseFloat(distanceToCampus),
        neighborhood,
        availableFrom,
        availableTo,
        flexibleDates,
        minimumStay: parseInt(minimumStay),
        rentPrice: listingType !== 'SWAP_ONLY' ? parseFloat(rentPrice) : undefined,
        securityDeposit: securityDeposit ? parseFloat(securityDeposit) : undefined,
        utilitiesIncluded,
        amenities,
        houseRules: {
          smokingAllowed: false,
          petsAllowed: amenities.petFriendly,
          guestsAllowed: true,
        },
        photos: [], // Will add photo upload later
      };
      
      const response = await apiService.createListing(listingData);
      
      if (response.success) {
        Alert.alert(
          'Success!',
          'Your listing has been created successfully.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Home'),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to create listing');
      }
    } catch (error: any) {
      console.error('Create listing error:', error);
      Alert.alert('Error', error.message || 'Failed to create listing');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4, 5].map((step) => (
        <View key={step} style={styles.stepWrapper}>
          <View
            style={[
              styles.stepCircle,
              currentStep >= step && styles.stepCircleActive,
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                currentStep >= step && styles.stepNumberActive,
              ]}
            >
              {step}
            </Text>
          </View>
          {step < 5 && (
            <View
              style={[
                styles.stepLine,
                currentStep > step && styles.stepLineActive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      
      <Text style={styles.label}>Listing Title</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Cozy 2BR Apartment Near Campus"
        value={title}
        onChangeText={setTitle}
        maxLength={100}
      />
      <Text style={styles.charCount}>{title.length}/100</Text>
      
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe your space, amenities, and what makes it special..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={6}
        maxLength={2000}
      />
      <Text style={styles.charCount}>{description.length}/2000</Text>
      
      <Text style={styles.label}>Listing Type</Text>
      {LISTING_TYPES.map((type) => (
        <TouchableOpacity
          key={type.value}
          style={[
            styles.typeOption,
            listingType === type.value && styles.typeOptionSelected,
          ]}
          onPress={() => setListingType(type.value)}
        >
          <View style={styles.typeOptionContent}>
            <Text style={[
              styles.typeOptionLabel,
              listingType === type.value && styles.typeOptionLabelSelected,
            ]}>
              {type.label}
            </Text>
            <Text style={styles.typeOptionDescription}>
              {type.description}
            </Text>
          </View>
          {listingType === type.value && (
            <Ionicons name="checkmark-circle" size={24} color="#667eea" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Property Details</Text>
      
      <Text style={styles.label}>Property Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.propertyTypes}>
        {PROPERTY_TYPES.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.propertyType,
              propertyType === type.value && styles.propertyTypeSelected,
            ]}
            onPress={() => setPropertyType(type.value)}
          >
            <MaterialCommunityIcons
              name={type.icon as any}
              size={32}
              color={propertyType === type.value ? '#667eea' : '#666'}
            />
            <Text style={[
              styles.propertyTypeLabel,
              propertyType === type.value && styles.propertyTypeLabelSelected,
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Bedrooms</Text>
          <TextInput
            style={styles.input}
            placeholder="Number of bedrooms"
            value={bedrooms}
            onChangeText={setBedrooms}
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Bathrooms</Text>
          <TextInput
            style={styles.input}
            placeholder="Number of bathrooms"
            value={bathrooms}
            onChangeText={setBathrooms}
            keyboardType="numeric"
          />
        </View>
      </View>
      
      <Text style={styles.label}>Square Feet (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Approximate square footage"
        value={squareFeet}
        onChangeText={setSquareFeet}
        keyboardType="numeric"
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Location</Text>
      
      <Text style={styles.label}>Street Address</Text>
      <TextInput
        style={styles.input}
        placeholder="123 University Ave"
        value={street}
        onChangeText={setStreet}
      />
      
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            placeholder="City"
            value={city}
            onChangeText={setCity}
          />
        </View>
        
        <View style={styles.halfWidth}>
          <Text style={styles.label}>State</Text>
          <TextInput
            style={styles.input}
            placeholder="State"
            value={state}
            onChangeText={setState}
            maxLength={2}
            autoCapitalize="characters"
          />
        </View>
      </View>
      
      <Text style={styles.label}>ZIP Code</Text>
      <TextInput
        style={styles.input}
        placeholder="ZIP Code"
        value={zipCode}
        onChangeText={setZipCode}
        keyboardType="numeric"
        maxLength={5}
      />
      
      <Text style={styles.label}>Nearest University</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Texas Tech University"
        value={nearUniversity}
        onChangeText={setNearUniversity}
      />
      
      <Text style={styles.label}>Distance to Campus (miles)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 1.5"
        value={distanceToCampus}
        onChangeText={setDistanceToCampus}
        keyboardType="decimal-pad"
      />
      
      <Text style={styles.label}>Neighborhood (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., University District"
        value={neighborhood}
        onChangeText={setNeighborhood}
      />
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Availability & Pricing</Text>
      
      <Text style={styles.label}>Available From</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowFromPicker(true)}
      >
        <Ionicons name="calendar-outline" size={20} color="#666" />
        <Text style={styles.dateText}>
          {availableFrom.toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      
      {showFromPicker && (
        <DateTimePicker
          value={availableFrom}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowFromPicker(false);
            if (date) setAvailableFrom(date);
          }}
        />
      )}
      
      <Text style={styles.label}>Available To</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowToPicker(true)}
      >
        <Ionicons name="calendar-outline" size={20} color="#666" />
        <Text style={styles.dateText}>
          {availableTo.toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      
      {showToPicker && (
        <DateTimePicker
          value={availableTo}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowToPicker(false);
            if (date) setAvailableTo(date);
          }}
        />
      )}
      
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Flexible on dates?</Text>
        <Switch
          value={flexibleDates}
          onValueChange={setFlexibleDates}
          trackColor={{ false: '#ccc', true: '#667eea' }}
        />
      </View>
      
      {listingType !== 'SWAP_ONLY' && (
        <>
          <Text style={styles.label}>Monthly Rent ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 1500"
            value={rentPrice}
            onChangeText={setRentPrice}
            keyboardType="numeric"
          />
          
          <Text style={styles.label}>Security Deposit (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 500"
            value={securityDeposit}
            onChangeText={setSecurityDeposit}
            keyboardType="numeric"
          />
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Utilities Included?</Text>
            <Switch
              value={utilitiesIncluded}
              onValueChange={setUtilitiesIncluded}
              trackColor={{ false: '#ccc', true: '#667eea' }}
            />
          </View>
        </>
      )}
      
      <Text style={styles.label}>Minimum Stay (days)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 7"
        value={minimumStay}
        onChangeText={setMinimumStay}
        keyboardType="numeric"
      />
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Amenities</Text>
      <Text style={styles.stepSubtitle}>Select all that apply</Text>
      
      {Object.entries(amenities).map(([key, value]) => (
        <View key={key} style={styles.amenityRow}>
          <Text style={styles.amenityLabel}>
            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
          </Text>
          <Switch
            value={value}
            onValueChange={(newValue) =>
              setAmenities({ ...amenities, [key]: newValue })
            }
            trackColor={{ false: '#ccc', true: '#667eea' }}
          />
        </View>
      ))}
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Listing</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {renderStepIndicator()}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderCurrentStep()}
        </ScrollView>
      </KeyboardAvoidingView>
      
      <View style={styles.footer}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.nextButtonText}>
                {currentStep === totalSteps ? 'Create Listing' : 'Next'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#667eea',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
  },
  stepLineActive: {
    backgroundColor: '#667eea',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  typeOptionSelected: {
    borderColor: '#667eea',
    backgroundColor: '#f8f9ff',
  },
  typeOptionContent: {
    flex: 1,
  },
  typeOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  typeOptionLabelSelected: {
    color: '#667eea',
  },
  typeOptionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  propertyTypes: {
    flexDirection: 'row',
    marginTop: 10,
  },
  propertyType: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    minWidth: 80,
  },
  propertyTypeSelected: {
    borderColor: '#667eea',
    backgroundColor: '#f8f9ff',
  },
  propertyTypeLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  propertyTypeLabelSelected: {
    color: '#667eea',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    flex: 1,
    marginRight: 10,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  amenityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  amenityLabel: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  backButton: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  nextButton: {
    flex: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default CreateListingScreen;