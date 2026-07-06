import colors from './colors';

export const font = {
  heading: 'Poppins_700Bold',
  headingAlt: 'Poppins_600SemiBold',
  body: 'Outfit_400Regular',
  bodyMedium: 'Outfit_500Medium',
  bodySemi: 'Outfit_600SemiBold',
};

export const type = {
  h1: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: colors.text,
  },
  h2: {
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '800',
    color: colors.text,
  },
  h3: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: colors.text,
  },
  bodyLg: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: colors.text,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    color: colors.textMuted,
  },
  micro: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
};

export default type;
