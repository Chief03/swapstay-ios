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
    background: '#0F172A',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    error: '#F87171',
    onPrimary: '#0F172A',
    onPrimaryContainer: '#E9D5FF',
    onSecondary: '#0F172A',
    onSecondaryContainer: '#DDD6FE',
    onBackground: '#F1F5F9',
    onSurface: '#F1F5F9',
    onSurfaceVariant: '#CBD5E1',
    onError: '#0F172A',
    outline: '#64748B',
    elevation: {
      level0: 'transparent',
      level1: '#1E293B',
      level2: '#334155',
      level3: '#475569',
      level4: '#64748B',
      level5: '#94A3B8',
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