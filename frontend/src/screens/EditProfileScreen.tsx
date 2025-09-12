import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/api';

interface EditProfileScreenProps {
  navigation: any;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    bio: '',
    yearInSchool: '',
    major: '',
    profilePicture: '',
    email: '',
    university: '',
    emailVerified: false,
  });

  const [originalData, setOriginalData] = useState({
    fullName: '',
    bio: '',
    yearInSchool: '',
    major: '',
    profilePicture: '',
    email: '',
    university: '',
    emailVerified: false,
  });

  const yearOptions = [
    { label: 'Select Year', value: '', icon: 'school-outline', description: 'Choose your academic level' },
    { label: 'Freshman', value: 'Freshman', icon: 'leaf-outline', description: 'First year student' },
    { label: 'Sophomore', value: 'Sophomore', icon: 'flower-outline', description: 'Second year student' },
    { label: 'Junior', value: 'Junior', icon: 'trending-up-outline', description: 'Third year student' },
    { label: 'Senior', value: 'Senior', icon: 'medal-outline', description: 'Fourth year student' },
    { label: 'Graduate', value: 'Graduate', icon: 'library-outline', description: 'Graduate student' },
    { label: 'PhD', value: 'PhD', icon: 'telescope-outline', description: 'Doctoral candidate' },
  ];

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCurrentUser();
      
      console.log('User data:', response.data); // Debug log
      
      if (response.data) {
        const user = response.data;
        const userData = {
          fullName: user.fullName || '',
          bio: user.bio || '',
          yearInSchool: user.yearInSchool || '',
          major: user.major || '',
          profilePicture: user.profilePicture || '',
          email: user.email || '',
          university: user.university || '',
          emailVerified: user.emailVerified || false,
        };
        
        console.log('Setting profile data:', userData); // Debug log
        setProfileData(userData);
        setOriginalData(userData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const hasChanges = () => {
    const editableFields = ['fullName', 'bio', 'yearInSchool', 'major', 'profilePicture'];
    const currentEditable = Object.fromEntries(
      editableFields.map(key => [key, profileData[key as keyof typeof profileData]])
    );
    const originalEditable = Object.fromEntries(
      editableFields.map(key => [key, originalData[key as keyof typeof originalData]])
    );
    
    return JSON.stringify(currentEditable) !== JSON.stringify(originalEditable);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to change your profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        handleInputChange('profilePicture', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      Alert.alert('No Changes', 'No changes have been made to save.');
      return;
    }

    try {
      setSaving(true);
      
      const updateData: any = {};
      
      if (profileData.fullName !== originalData.fullName) {
        updateData.fullName = profileData.fullName.trim();
      }
      if (profileData.bio !== originalData.bio) {
        updateData.bio = profileData.bio.trim();
      }
      if (profileData.yearInSchool !== originalData.yearInSchool) {
        updateData.yearInSchool = profileData.yearInSchool;
      }
      if (profileData.major !== originalData.major) {
        updateData.major = profileData.major.trim();
      }
      if (profileData.profilePicture !== originalData.profilePicture) {
        updateData.profilePicture = profileData.profilePicture;
      }

      const response = await apiService.updateUser(updateData);
      
      if (response.success) {
        setOriginalData(profileData);
        Alert.alert(
          'Success', 
          'Your profile has been updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard Changes',
            style: 'destructive',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleYearSelect = (year: string) => {
    handleInputChange('yearInSchool', year);
    setShowYearPicker(false);
  };

  const getSelectedYearOption = () => {
    return yearOptions.find(option => option.value === profileData.yearInSchool) || yearOptions[0];
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            Edit Profile
          </Text>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.headerButton, { opacity: hasChanges() ? 1 : 0.5 }]}
            disabled={saving || !hasChanges()}
          >
            {saving ? (
              <ActivityIndicator size={20} color={theme.colors.primary} />
            ) : (
              <Text style={[styles.saveButtonText, { color: theme.colors.primary }]}>
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Picture */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Profile Picture
            </Text>
            <View style={styles.profilePictureContainer}>
              <Image 
                source={{ 
                  uri: profileData.profilePicture || 'https://i.pravatar.cc/150?img=8' 
                }} 
                style={styles.profilePicture} 
              />
              <TouchableOpacity 
                style={[styles.changePhotoButton, { backgroundColor: theme.colors.primary }]}
                onPress={pickImage}
              >
                <Ionicons name="camera" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={pickImage}>
              <Text style={[styles.changePhotoText, { color: theme.colors.primary }]}>
                Change Photo
              </Text>
            </TouchableOpacity>
          </View>

          {/* Read-only Information */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Account Information
            </Text>
            
            {/* Email */}
            <View style={styles.readOnlyField}>
              <Text style={[styles.label, { color: theme.colors.onBackground }]}>
                Email Address
              </Text>
              <View style={[styles.readOnlyContainer, { 
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: theme.colors.outline 
              }]}>
                <Text style={[styles.readOnlyText, { color: theme.colors.onSurface }]}>
                  {profileData.email || 'Not available'}
                </Text>
                <View style={styles.verificationBadge}>
                  {profileData.emailVerified ? (
                    <>
                      <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                      <Text style={[styles.verificationText, { color: '#10b981' }]}>Verified</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="alert-circle" size={16} color="#f59e0b" />
                      <Text style={[styles.verificationText, { color: '#f59e0b' }]}>Unverified</Text>
                    </>
                  )}
                </View>
              </View>
            </View>

            {/* University */}
            <View style={styles.readOnlyField}>
              <Text style={[styles.label, { color: theme.colors.onBackground }]}>
                University
              </Text>
              <View style={[styles.readOnlyContainer, { 
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: theme.colors.outline 
              }]}>
                <Text style={[styles.readOnlyText, { color: theme.colors.onSurface }]}>
                  {profileData.university || 'Not available'}
                </Text>
                <Ionicons name="school-outline" size={18} color={theme.colors.onSurfaceVariant} />
              </View>
            </View>
          </View>

          {/* Editable Information */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Personal Information
            </Text>
          </View>

          {/* Full Name */}
          <View style={styles.inputSection}>
            <Text style={[styles.label, { color: theme.colors.onBackground }]}>
              Full Name
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.surface,
                color: theme.colors.onSurface,
                borderColor: theme.colors.outline
              }]}
              value={profileData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              placeholder="Enter your full name"
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />
          </View>

          {/* Bio */}
          <View style={styles.inputSection}>
            <Text style={[styles.label, { color: theme.colors.onBackground }]}>
              Bio
            </Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: theme.colors.surface,
                color: theme.colors.onSurface,
                borderColor: theme.colors.outline
              }]}
              value={profileData.bio}
              onChangeText={(value) => handleInputChange('bio', value)}
              placeholder="Tell us about yourself..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={[styles.characterCount, { color: theme.colors.onSurfaceVariant }]}>
              {profileData.bio.length}/500
            </Text>
          </View>

          {/* Interactive Year in School */}
          <View style={styles.inputSection}>
            <Text style={[styles.label, { color: theme.colors.onBackground }]}>
              Year in School
            </Text>
            
            {/* Current Selection Display */}
            <TouchableOpacity
              style={[styles.yearSelector, { 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outline
              }]}
              onPress={() => setShowYearPicker(!showYearPicker)}
            >
              <View style={styles.yearSelectorContent}>
                <View style={styles.yearSelectorLeft}>
                  <Ionicons 
                    name={getSelectedYearOption().icon as any} 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                  <View>
                    <Text style={[styles.yearSelectorText, { color: theme.colors.onSurface }]}>
                      {getSelectedYearOption().label}
                    </Text>
                    {getSelectedYearOption().value && (
                      <Text style={[styles.yearSelectorDescription, { color: theme.colors.onSurfaceVariant }]}>
                        {getSelectedYearOption().description}
                      </Text>
                    )}
                  </View>
                </View>
                <Ionicons 
                  name={showYearPicker ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={theme.colors.onSurfaceVariant} 
                />
              </View>
            </TouchableOpacity>

            {/* Year Options */}
            {showYearPicker && (
              <View style={[styles.yearPickerContainer, { backgroundColor: theme.colors.surface }]}>
                {yearOptions.map((option, index) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.yearOption, 
                      { borderBottomColor: theme.colors.outline },
                      index === yearOptions.length - 1 && styles.lastYearOption,
                      option.value === profileData.yearInSchool && { 
                        backgroundColor: theme.colors.primaryContainer 
                      }
                    ]}
                    onPress={() => handleYearSelect(option.value)}
                  >
                    <View style={styles.yearOptionContent}>
                      <Ionicons 
                        name={option.icon as any} 
                        size={18} 
                        color={option.value === profileData.yearInSchool ? theme.colors.primary : theme.colors.onSurfaceVariant} 
                      />
                      <View style={styles.yearOptionText}>
                        <Text style={[
                          styles.yearOptionLabel, 
                          { color: theme.colors.onSurface },
                          option.value === profileData.yearInSchool && { fontWeight: '600' }
                        ]}>
                          {option.label}
                        </Text>
                        <Text style={[styles.yearOptionDescription, { color: theme.colors.onSurfaceVariant }]}>
                          {option.description}
                        </Text>
                      </View>
                      {option.value === profileData.yearInSchool && (
                        <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Major */}
          <View style={styles.inputSection}>
            <Text style={[styles.label, { color: theme.colors.onBackground }]}>
              Major
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.surface,
                color: theme.colors.onSurface,
                borderColor: theme.colors.outline
              }]}
              value={profileData.major}
              onChangeText={(value) => handleInputChange('major', value)}
              placeholder="Enter your major"
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputSection: {
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    marginTop: 5,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#6366f1',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  changePhotoText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 50,
  },
  readOnlyField: {
    marginBottom: 20,
  },
  readOnlyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
  },
  readOnlyText: {
    fontSize: 16,
    flex: 1,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verificationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  yearSelector: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  yearSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  yearSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  yearSelectorText: {
    fontSize: 16,
    fontWeight: '500',
  },
  yearSelectorDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  yearPickerContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  yearOption: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  lastYearOption: {
    borderBottomWidth: 0,
  },
  yearOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  yearOptionText: {
    flex: 1,
  },
  yearOptionLabel: {
    fontSize: 16,
  },
  yearOptionDescription: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default EditProfileScreen;