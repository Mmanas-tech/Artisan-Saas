export const colors = {
  primary: '#A0522D',
  primaryLight: '#D4A574',
  primaryDark: '#6B3410',
  accent: {
    clay: '#CD7F32',
    indigo: '#4B0082',
    marigold: '#FFB700',
    sage: '#9CAF88',
  },
  semantic: {
    success: '#66BB6A',
    warning: '#FFA726',
    error: '#EF5350',
    offline: '#BDBDBD',
  },
  background: {
    light: '#FBF7F3',
    card: '#FFFFFF',
    dark: '#1A1A1A',
    surfaceDark: '#2D2D2D',
    elevatedDark: '#3A3A3A',
  },
  text: {
    primary: '#333333',
    secondary: '#666666',
    muted: '#999999',
    onPrimary: '#FFFFFF',
    darkPrimary: '#F5F5F5',
    darkSecondary: '#BDBDBD',
  },
  border: {
    light: '#D3D3D3',
    dark: '#4A4A4A',
  },
};

export type ColorTheme = 'light' | 'dark' | 'system';

export function getThemeColors(isDark: boolean) {
  return {
    background: isDark ? colors.background.dark : colors.background.light,
    surface: isDark ? colors.background.surfaceDark : colors.background.card,
    elevated: isDark ? colors.background.elevatedDark : colors.background.card,
    text: isDark ? colors.text.darkPrimary : colors.text.primary,
    textSecondary: isDark ? colors.text.darkSecondary : colors.text.secondary,
    textMuted: colors.text.muted,
    primary: colors.primary,
    primaryLight: colors.primaryLight,
    primaryDark: colors.primaryDark,
    accent: colors.accent,
    semantic: colors.semantic,
    border: isDark ? colors.border.dark : colors.border.light,
  };
}
