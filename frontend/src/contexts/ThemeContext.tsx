import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MD3LightTheme, MD3DarkTheme, PaperProvider, adaptNavigationTheme } from 'react-native-paper';
import { DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6B46C1',
    primaryContainer: '#E9DDF7',
    secondary: '#8B5CF6',
    secondaryContainer: '#F3E8FF',
    tertiary: '#A78BFA',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    surfaceVariant: '#F3F4F6',
    error: '#EF4444',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#6B46C1',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#8B5CF6',
    onBackground: '#1F2937',
    onSurface: '#1F2937',
    onSurfaceVariant: '#6B7280',
    onError: '#FFFFFF',
    outline: '#D1D5DB',
    elevation: {
      level0: 'transparent',
      level1: '#F9FAFB',
      level2: '#F3F4F6',
      level3: '#E5E7EB',
      level4: '#D1D5DB',
      level5: '#9CA3AF',
    },
  },
};

const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#A78BFA',
    primaryContainer: '#4C1D95',
    secondary: '#C4B5FD',
    secondaryContainer: '#5B21B6',
    tertiary: '#DDD6FE',
    background: '#111827',
    surface: '#1F2937',
    surfaceVariant: '#374151',
    error: '#F87171',
    onPrimary: '#1F2937',
    onPrimaryContainer: '#E9D5FF',
    onSecondary: '#1F2937',
    onSecondaryContainer: '#DDD6FE',
    onBackground: '#F9FAFB',
    onSurface: '#F9FAFB',
    onSurfaceVariant: '#D1D5DB',
    onError: '#1F2937',
    outline: '#4B5563',
    elevation: {
      level0: 'transparent',
      level1: '#1F2937',
      level2: '#374151',
      level3: '#4B5563',
      level4: '#6B7280',
      level5: '#9CA3AF',
    },
  },
};

const { LightTheme: NavigationLight, DarkTheme: NavigationDark } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
  materialLight: customLightTheme,
  materialDark: customDarkTheme,
});

export const CombinedLightTheme = {
  ...NavigationLight,
  ...customLightTheme,
  colors: {
    ...NavigationLight.colors,
    ...customLightTheme.colors,
  },
};

export const CombinedDarkTheme = {
  ...NavigationDark,
  ...customDarkTheme,
  colors: {
    ...NavigationDark.colors,
    ...customDarkTheme.colors,
  },
};

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: typeof CombinedLightTheme | typeof CombinedDarkTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = isDarkMode ? CombinedDarkTheme : CombinedLightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};