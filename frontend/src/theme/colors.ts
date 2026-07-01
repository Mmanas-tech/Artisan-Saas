import { useColorScheme } from 'react-native';

export const colors = {
  light: {
    background: '#FBF7F3',
    surface: '#FFFFFF',
    primary: '#A0522D',
    primaryLight: '#D4A574',
    primaryDark: '#6B3410',
    text: '#333333',
    textSecondary: '#666666',
    textMuted: '#999999',
    border: '#E8E0D8',
    success: '#66BB6A',
    warning: '#FFA726',
    error: '#EF5350',
    accent: '#FFB700',
  },
  dark: {
    background: '#1A1A1A',
    surface: '#2D2D2D',
    primary: '#D4A574',
    primaryLight: '#E8C9A0',
    primaryDark: '#A0522D',
    text: '#F5F5F5',
    textSecondary: '#BDBDBD',
    textMuted: '#888888',
    border: '#3A3A3A',
    success: '#81C784',
    warning: '#FFB74D',
    error: '#EF5350',
    accent: '#FFD54F',
  },
};

export type ThemeColors = typeof colors.light;

export function useThemeColors(): ThemeColors {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? colors.dark : colors.light;
}
