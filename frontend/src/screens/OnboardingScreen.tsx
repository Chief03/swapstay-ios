import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const onboardingData = [
    {
      id: 1,
      title: 'Find Your Perfect Swap',
      subtitle: 'Discover Amazing Stays',
      description: 'Browse verified student listings from universities nationwide. Every user is verified with a .edu email for your safety.',
      icon: 'home-search-outline',
      iconType: 'MaterialCommunityIcons',
      gradientColors: ['#667eea', '#764ba2'],
      backgroundColor: '#f0f4ff',
      features: ['Verified .edu students', 'Nationwide listings', 'Safe & secure'],
    },
    {
      id: 2,
      title: 'Connect & Match',
      subtitle: 'Build Your Network',
      description: 'Message other students, discuss swap details, and find the perfect match for your dates and preferences.',
      icon: 'user-friends',
      iconType: 'FontAwesome5',
      gradientColors: ['#f093fb', '#f5576c'],
      backgroundColor: '#fff0f5',
      features: ['Instant messaging', 'Smart matching', 'Flexible dates'],
    },
    {
      id: 3,
      title: 'Swap with Confidence',
      subtitle: 'Travel & Save',
      description: 'Our verification system and student community ensures safe, reliable swaps. Experience new cities while saving money!',
      icon: 'shield-check',
      iconType: 'MaterialCommunityIcons',
      gradientColors: ['#4facfe', '#00f2fe'],
      backgroundColor: '#f0faff',
      features: ['Verified community', 'Save on housing', 'New experiences'],
    },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentPage]);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    if (page !== currentPage) {
      setCurrentPage(page);
      animatePageChange();
    }
  };

  const animatePageChange = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.8);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const scrollToPage = (page: number) => {
    scrollViewRef.current?.scrollTo({ x: page * SCREEN_WIDTH, animated: true });
    setCurrentPage(page);
  };

  const handleNext = () => {
    if (currentPage < onboardingData.length - 1) {
      scrollToPage(currentPage + 1);
    } else {
      onComplete();
    }
  };

  const renderIcon = (item: any) => {
    switch (item.iconType) {
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={item.icon as any} size={50} color="#fff" />;
      case 'FontAwesome5':
        return <FontAwesome5 name={item.icon as any} size={45} color="#fff" />;
      default:
        return <Ionicons name={item.icon as any} size={50} color="#fff" />;
    }
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {onboardingData.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => scrollToPage(index)}
            style={[
              styles.dot,
              currentPage === index && styles.activeDot,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ffffff', onboardingData[currentPage].backgroundColor]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity style={styles.skipButton} onPress={onComplete}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {onboardingData.map((item, index) => (
            <View key={item.id} style={[styles.page, { backgroundColor: 'transparent' }]}>
              <Animated.View 
                style={[
                  styles.contentContainer,
                  {
                    opacity: currentPage === index ? fadeAnim : 0.3,
                    transform: [
                      { translateY: currentPage === index ? slideAnim : 50 },
                      { scale: currentPage === index ? scaleAnim : 0.8 }
                    ]
                  }
                ]}
              >
                <LinearGradient
                  colors={item.gradientColors}
                  style={styles.iconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {renderIcon(item)}
                </LinearGradient>
                
                <Text style={styles.subtitle}>{item.subtitle}</Text>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
                
                <View style={styles.featuresContainer}>
                  {item.features.map((feature, idx) => (
                    <View key={idx} style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={20} color={item.gradientColors[0]} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
              
              <View style={styles.illustrationContainer}>
                <View style={styles.circleDecoration1} />
                <View style={styles.circleDecoration2} />
                <View style={styles.circleDecoration3} />
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.bottomContainer}>
          {renderDots()}
          
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={onboardingData[currentPage].gradientColors}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.nextButtonText}>
                {currentPage === onboardingData.length - 1 ? "Get Started" : "Next"}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
  },
  skipText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 17,
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  featuresContainer: {
    marginTop: 20,
    alignItems: 'flex-start',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  featureText: {
    fontSize: 15,
    color: '#444',
    marginLeft: 10,
    fontWeight: '500',
  },
  illustrationContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    opacity: 0.1,
    pointerEvents: 'none',
  },
  circleDecoration1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#667eea',
    top: -50,
    right: -50,
  },
  circleDecoration2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f093fb',
    bottom: 100,
    left: -30,
  },
  circleDecoration3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4facfe',
    top: SCREEN_HEIGHT / 2,
    right: 30,
  },
  bottomContainer: {
    paddingHorizontal: 30,
    paddingBottom: 30,
    paddingTop: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
    transition: 'all 0.3s',
  },
  activeDot: {
    backgroundColor: '#667eea',
    width: 30,
    transform: [{ scaleY: 1.2 }],
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
    letterSpacing: 0.5,
  },
});

export default OnboardingScreen;