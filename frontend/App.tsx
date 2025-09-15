import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import WishlistScreen from './src/screens/WishlistScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';
import CreateListingScreen from './src/screens/CreateListingScreen';
import ListingDetailScreen from './src/screens/ListingDetailScreen';
import FilterScreen from './src/screens/FilterScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import ChatScreen from './src/screens/ChatScreen';
import MyRequestsScreen from './src/screens/MyRequestsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AppContent() {
  // Set to false to skip onboarding during development
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { theme, isDarkMode } = useTheme();

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleAuthenticate = () => {
    setIsAuthenticated(true);
  };

  const handleBackToOnboarding = () => {
    setShowOnboarding(true);
  };

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  if (!isAuthenticated) {
    return (
      <AuthScreen 
        onAuthenticate={handleAuthenticate} 
        onBackToOnboarding={handleBackToOnboarding}
      />
    );
  }

  function TabNavigator() {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Wishlist') {
              iconName = focused ? 'heart' : 'heart-outline';
            } else if (route.name === 'Messages') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outline,
          },
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.onSurface,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'SwapStay' }} />
        <Tab.Screen name="Wishlist" component={WishlistScreen} />
        <Tab.Screen name="Messages" component={MessagesScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    );
  }

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator>
        <Stack.Screen 
          name="MainTabs" 
          component={TabNavigator} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="CreateListing" 
          component={CreateListingScreen}
          options={{ 
            title: 'Create Listing',
            presentation: 'modal',
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
            headerTintColor: theme.colors.onSurface,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen 
          name="ListingDetail" 
          component={ListingDetailScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Filter" 
          component={FilterScreen}
          options={{ 
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfileScreen}
          options={{ 
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen}
          options={{ 
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="MyRequests" 
          component={MyRequestsScreen}
          options={{ 
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
