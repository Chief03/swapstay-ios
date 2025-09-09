import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const onboardingData = [
    {
      id: 1,
      title: 'Find Your Perfect Swap',
      description: 'Browse verified student listings from universities nationwide. Every user is verified with a .edu email for your safety.',
      icon: 'search',
      color: '#6366f1',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    },
    {
      id: 2,
      title: 'Connect & Match',
      description: 'Message other students, discuss swap details, and find the perfect match for your dates and preferences.',
      icon: 'people',
      color: '#8b5cf6',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
    },
    {
      id: 3,
      title: 'Swap with Confidence',
      description: 'Our verification system and student community ensures safe, reliable swaps. Experience new cities while saving money!',
      icon: 'shield-checkmark',
      color: '#3b82f6',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    },
  ];

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentPage(page);
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
    <SafeAreaView style={styles.container}>
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
          <View key={item.id} style={styles.page}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.image }}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay} />
            </View>
            
            <View style={styles.contentContainer}>
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon as any} size={40} color="#fff" />
              </View>
              
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomContainer}>
        {renderDots()}
        
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentPage === onboardingData.length - 1 ? "Get Started" : "Next"}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
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
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  imageContainer: {
    height: SCREEN_HEIGHT * 0.45,
    width: SCREEN_WIDTH,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    background: 'linear-gradient(to bottom, transparent, white)',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
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
  },
  activeDot: {
    backgroundColor: '#6366f1',
    width: 30,
  },
  nextButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default OnboardingScreen;