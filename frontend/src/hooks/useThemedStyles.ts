import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export function useThemedStyles<T>(createStyles: (theme: any, isDarkMode: boolean) => T): T {
  const { theme, isDarkMode } = useTheme();
  
  return useMemo(
    () => createStyles(theme, isDarkMode),
    [theme, isDarkMode, createStyles]
  );
}

export default useThemedStyles;