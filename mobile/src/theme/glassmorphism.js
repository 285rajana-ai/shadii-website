import { Platform, StyleSheet } from 'react-native';
import colors from './colors';
import { radius, spacing } from './spacing';

// Luxury Glassmorphism card styles
export const glassStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.glassMedium,
    borderWidth: 1,
    borderColor: colors.glassBorderLight,
    borderRadius: radius.xl,
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
    borderRadius: radius.xl,
    overflow: 'hidden',
  },

  pill: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorderLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },

  input: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 16,
  },

  inputFocused: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },

  button: {
    borderRadius: radius.md,
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
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
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxxl : spacing.xl,
    borderWidth: 1,
    borderColor: colors.glassBorderLight,
  },

  badge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  badgeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});

export { radius, spacing };

export default glassStyles;
