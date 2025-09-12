import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  Animated,
  FlatList,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AuthScreenProps {
  onAuthenticate: () => void;
  onBackToOnboarding?: () => void;
}

const POPULAR_UNIVERSITIES = [
  'Harvard University',
  'Stanford University',
  'MIT',
  'Yale University',
  'Columbia University',
  'UC Berkeley',
  'UCLA',
  'NYU',
  'University of Michigan',
  'University of Texas at Austin',
  'Texas Tech University',
  'Texas A&M University',
  'Rice University',
  'SMU',
  'Boston University',
  'Northwestern University',
  'Duke University',
  'University of Chicago',
  'Cornell University',
  'University of Pennsylvania',
  'Brown University',
  'Carnegie Mellon University',
  'Georgetown University',
  'University of Washington',
  'Arizona State University',
  'University of Arizona',
  'USC',
  'UC San Diego',
  'UC Irvine',
  'UC Santa Barbara',
  'University of Florida',
  'Florida State University',
  'Georgia Tech',
  'University of Georgia',
  'Vanderbilt University',
  'University of North Carolina',
  'NC State University',
  'Virginia Tech',
  'University of Virginia',
  'Ohio State University',
  'Purdue University',
  'Indiana University',
  'University of Illinois',
  'University of Wisconsin',
  'University of Minnesota',
  'Michigan State University',
  'Penn State University',
  'University of Maryland',
  'Rutgers University',
  'University of Colorado Boulder',
  'Colorado State University',
  'University of Oregon',
  'Oregon State University',
  'University of Utah',
  'BYU',
  'Baylor University',
  'TCU',
  'University of Oklahoma',
  'Oklahoma State University',
  'University of Kansas',
  'Kansas State University',
  'University of Missouri',
  'University of Iowa',
  'Iowa State University',
  'University of Nebraska',
  'University of Alabama',
  'Auburn University',
  'LSU',
  'University of Tennessee',
  'University of Kentucky',
  'University of South Carolina',
  'Clemson University',
  'University of Miami',
  'University of Pittsburgh',
  'Syracuse University',
  'University of Connecticut',
  'Northeastern University',
  'Boston College',
  'Tufts University',
  'University of Rochester',
  'Case Western Reserve University',
  'University of Cincinnati',
  'University of Delaware',
  'Drexel University',
  'Temple University',
  'Villanova University',
  'University of Notre Dame',
  'Marquette University',
  'DePaul University',
  'Loyola University Chicago',
  'Saint Louis University',
  'Washington University in St. Louis',
  'Emory University',
  'Tulane University',
  'Wake Forest University',
  'University of Richmond',
  'William & Mary',
  'James Madison University',
  'George Washington University',
  'American University',
  'Howard University',
  'Hampton University',
  'Morehouse College',
  'Spelman College',
  'Xavier University',
  'Prairie View A&M University',
  'University of Houston',
  'University of North Texas',
  'UT Dallas',
  'UT San Antonio',
  'Texas State University',
];

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticate, onBackToOnboarding }) => {
  const { theme, isDarkMode } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [university, setUniversity] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showUniversityPicker, setShowUniversityPicker] = useState(false);
  const [filteredUniversities, setFilteredUniversities] = useState(POPULAR_UNIVERSITIES);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isLogin]);

  useEffect(() => {
    if (email.length > 0) {
      setEmailValid(email.endsWith('.edu'));
    } else {
      setEmailValid(null);
    }
  }, [email]);

  useEffect(() => {
    if (university) {
      const filtered = POPULAR_UNIVERSITIES.filter(uni =>
        uni.toLowerCase().includes(university.toLowerCase())
      );
      setFilteredUniversities(filtered.length > 0 ? filtered : POPULAR_UNIVERSITIES);
    } else {
      setFilteredUniversities(POPULAR_UNIVERSITIES);
    }
  }, [university]);

  const handleAuth = async () => {
    if (!email.endsWith('.edu')) {
      Alert.alert(
        'University Email Required',
        'SwapStay is exclusive to verified college students. Please use your .edu email address to continue.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Please make sure your passwords match');
      return;
    }

    if (!isLogin && !university) {
      Alert.alert('University Required', 'Please select your university to continue');
      return;
    }

    if (!isLogin && !fullName) {
      Alert.alert('Name Required', 'Please enter your full name');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      let response;
      
      if (isLogin) {
        response = await apiService.login({
          email: email.toLowerCase(),
          password,
        });
      } else {
        const universityDomain = email.split('@')[1];
        response = await apiService.register({
          fullName,
          email: email.toLowerCase(),
          password,
          university,
          universityDomain,
        });
      }

      if (response.success) {
        if (!isLogin) {
          Alert.alert(
            'Registration Successful',
            'Please check your email to verify your account before logging in.',
            [{ text: 'OK', onPress: () => setIsLogin(true) }]
          );
        } else {
          onAuthenticate();
        }
      } else {
        Alert.alert('Error', response.message || 'Something went wrong');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to connect to server. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const selectUniversity = (uni: string) => {
    setUniversity(uni);
    setShowUniversityPicker(false);
  };

  const getEmailDomain = () => {
    if (email.includes('@')) {
      const domain = email.split('@')[1];
      if (domain.endsWith('.edu')) {
        return domain.replace('.edu', '').toUpperCase();
      }
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <SafeAreaView style={styles.safeArea}>
        {/* Back Button */}
        {onBackToOnboarding && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={onBackToOnboarding}
            activeOpacity={0.7}
          >
            <View style={styles.backButtonCircle}>
              <Ionicons name="arrow-back" size={24} color="#667eea" />
            </View>
          </TouchableOpacity>
        )}
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Logo/Header */}
            <Animated.View 
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../../assets/logo.png')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.appName}>SwapStay</Text>
              <Text style={styles.tagline}>Exclusive College Housing Exchange</Text>
              <View style={styles.badge}>
                <FontAwesome5 name="graduation-cap" size={14} color="#667eea" />
                <Text style={styles.badgeText}>.EDU STUDENTS ONLY</Text>
              </View>
            </Animated.View>

            {/* Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, isLogin && styles.activeToggle]}
                onPress={() => setIsLogin(true)}
              >
                <Text style={[styles.toggleText, isLogin && styles.activeToggleText]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, !isLogin && styles.activeToggle]}
                onPress={() => setIsLogin(false)}
              >
                <Text style={[styles.toggleText, !isLogin && styles.activeToggleText]}>
                  Join SwapStay
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <Animated.View 
              style={[
                styles.form,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={[styles.inputContainer, emailValid === false && styles.inputError]}>
                <Ionicons 
                  name="school-outline" 
                  size={20} 
                  color={emailValid === false ? '#e74c3c' : '#666'} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  placeholder="Your .edu email address"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {emailValid === true && (
                  <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                )}
                {emailValid === false && (
                  <Ionicons name="close-circle" size={20} color="#e74c3c" />
                )}
              </View>
              {emailValid === false && (
                <Text style={styles.errorText}>Must be a valid .edu email address</Text>
              )}
              {emailValid === true && getEmailDomain() && (
                <View style={styles.verifiedContainer}>
                  <Ionicons name="shield-checkmark" size={16} color="#27ae60" />
                  <Text style={styles.verifiedText}>Verified: {getEmailDomain()} Student</Text>
                </View>
              )}

              {!isLogin && (
                <>
                  <TouchableOpacity 
                    style={styles.inputContainer}
                    onPress={() => setShowUniversityPicker(true)}
                  >
                    <MaterialCommunityIcons 
                      name="school-outline" 
                      size={20} 
                      color="#666" 
                      style={styles.inputIcon} 
                    />
                    <Text style={[styles.input, !university && styles.placeholderText]}>
                      {university || 'Select your university'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                  </TouchableOpacity>

                  {!isLogin && (
                    <View style={styles.inputContainer}>
                      <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        placeholderTextColor="#999"
                        value={fullName}
                        onChangeText={setFullName}
                        autoCapitalize="words"
                      />
                    </View>
                  )}
                </>
              )}

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={isLogin ? "Password" : "Create password (8+ characters)"}
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm password"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                  />
                  {confirmPassword.length > 0 && (
                    <Ionicons 
                      name={password === confirmPassword ? "checkmark-circle" : "close-circle"} 
                      size={20} 
                      color={password === confirmPassword ? "#27ae60" : "#e74c3c"} 
                    />
                  )}
                </View>
              )}

              {isLogin && (
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={[styles.authButton, isLoading && styles.authButtonDisabled]} 
                onPress={handleAuth} 
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={isLoading ? ['#95a5a6', '#7f8c8d'] : ['#667eea', '#764ba2']}
                  style={styles.authButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.authButtonText}>
                        {isLogin ? 'Sign In to SwapStay' : 'Join the Community'}
                      </Text>
                      <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Info Box */}
              <View style={styles.infoBox}>
                <View style={styles.infoHeader}>
                  <MaterialCommunityIcons name="shield-check" size={20} color="#667eea" />
                  <Text style={styles.infoTitle}>Why .EDU Email Only?</Text>
                </View>
                <Text style={styles.infoText}>
                  SwapStay is exclusive to verified college students to ensure a safe, 
                  trusted community for housing exchanges.
                </Text>
              </View>
            </Animated.View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {isLogin ? "New to SwapStay? " : "Already a member? "}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.footerLink}>
                  {isLogin ? 'Create Account' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Terms */}
            <Text style={styles.terms}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
            
            {/* Optional: Add a text link to go back to tour */}
            {onBackToOnboarding && (
              <TouchableOpacity onPress={onBackToOnboarding} style={styles.tourLinkContainer}>
                <Text style={styles.tourLink}>
                  <Ionicons name="information-circle-outline" size={14} color="#667eea" />
                  {' '}Want to see how SwapStay works?
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* University Picker Modal */}
      <Modal
        visible={showUniversityPicker}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your University</Text>
              <TouchableOpacity onPress={() => setShowUniversityPicker(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search universities..."
                placeholderTextColor="#999"
                value={university}
                onChangeText={setUniversity}
              />
            </View>
            <FlatList
              data={filteredUniversities}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.universityItem}
                  onPress={() => selectUniversity(item)}
                >
                  <FontAwesome5 name="university" size={16} color="#667eea" />
                  <Text style={styles.universityText}>{item}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 350,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 15,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#667eea',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeToggle: {
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  toggleText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  activeToggleText: {
    color: '#fff',
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fff5f5',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 13,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 5,
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fff4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: -8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27ae60',
  },
  verifiedText: {
    color: '#27ae60',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  authButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  authButtonDisabled: {
    opacity: 0.7,
  },
  authButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoBox: {
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#667eea',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  footerText: {
    color: '#666',
    fontSize: 15,
  },
  footerLink: {
    color: '#667eea',
    fontSize: 15,
    fontWeight: '700',
  },
  terms: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
  },
  termsLink: {
    color: '#667eea',
    textDecorationLine: 'underline',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 100,
  },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tourLinkContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  tourLink: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  universityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  universityText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
});

export default AuthScreen;