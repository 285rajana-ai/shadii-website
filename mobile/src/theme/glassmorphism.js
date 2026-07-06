import { Platform, StyleSheet } from 'react-native';
import colors from './colors';
import { radius, spacing } from './spacing';

export const softShadow = Platform.select({
  ios: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
  },
  android: {
    elevation: 3,
  },
});

export const glassStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...softShadow,
  },

  cardPremium: {
    backgroundColor: colors.primaryLightBg,
    borderWidth: 1,
    borderColor: colors.accentLight,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },

  pill: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },

  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 16,
  },

  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: '#FFFDF9',
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
    backgroundColor: 'rgba(32, 33, 36, 0.42)',
  },

  modal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxxl : spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },

  badge: {
    backgroundColor: colors.primaryLightBg,
    borderWidth: 1,
    borderColor: colors.accentLight,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});

export { radius, spacing };

export default glassStyles;
