import { StyleSheet, Platform } from 'react-native';
import colors from './colors';

// Luxury Glassmorphism card styles
export const glassStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.glassMedium,
    borderWidth: 1,
    borderColor: colors.glassBorderLight,
    borderRadius: 22,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },

  cardPremium: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)', // Subtle gold tint
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 22,
    overflow: 'hidden',
  },

  pill: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorderLight,
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  input: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: colors.text,
    fontSize: 16,
  },

  inputFocused: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },

  button: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },

  modal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderWidth: 1,
    borderColor: colors.glassBorderLight,
  },

  badge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  badgeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  huge: 64,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 32,
  full: 999,
};

export default glassStyles;
